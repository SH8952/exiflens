import type { ParsedExif } from "./exif";
import { formatShutterSpeed } from "./exif";
// Type-only import — erased at compile time, so `libraw-wasm` (kept as a
// devDependency purely for this) never reaches the runtime bundle. See
// `importLibRaw` below for why the real module is loaded a different way.
import type LibRawCtor from "libraw-wasm";

/**
 * Loads LibRaw-Wasm from a vendored copy in `public/vendor/libraw-wasm/`
 * instead of `import("libraw-wasm")`.
 *
 * The package's own module (`new Worker(new URL('./worker.js',
 * import.meta.url), { type: 'module' })` plus a co-located `.wasm` file)
 * makes Next.js's Turbopack production build hang indefinitely trying to
 * bundle it (confirmed 2026-08-31: `npm run build` never completed with it
 * as a normal dependency, even after 5+ minutes). Serving its already-built
 * `dist/` files as static assets and loading them with a plain runtime
 * `import()` of an absolute URL sidesteps bundling entirely — the browser
 * fetches and resolves them itself, exactly like any other static asset.
 * TypeScript can't resolve that absolute-URL specifier to a real module, so
 * the import is cast to `libraw-wasm`'s own (structurally identical) type.
 */
function importLibRaw(): Promise<{ default: typeof LibRawCtor }> {
  // @ts-expect-error -- absolute-URL specifier isn't a real module TypeScript
  // can resolve; see the function comment above for why it's loaded this way.
  return import(/* webpackIgnore: true */ "/vendor/libraw-wasm/index.js");
}

/**
 * Camera RAW extensions that `exifreader` (the library used for every other
 * file type) never officially supported — its own README support table only
 * lists JPEG/JPEG XL/TIFF/PNG/HEIC/AVIF/WebP/GIF. Canon `.cr3` in particular
 * uses an ISO-BMFF container `exifreader` doesn't even recognize as an
 * image, so parsing failed outright regardless of file size or how valid the
 * embedded EXIF was (석한 리포트, 2026-08-31: 데스크탑 RAW 업로드·갤럭시 Expert RAW
 * DNG 모두 "메타데이터를 읽을 수 없음" 오류 — 사이트 문구상 "지원"한다고 되어 있었지만
 * 실제로는 한 번도 신뢰성 있게 동작한 적이 없었던 것으로 확인됨).
 *
 * `libraw-wasm` (LibRaw compiled to WebAssembly) is a dedicated RAW library
 * with broad real camera coverage — Canon/Nikon/Sony/Fuji/Panasonic/Olympus/
 * Pentax/Samsung/Hasselblad/... — and is used instead for every one of these
 * extensions, replacing the previous "hope exifreader's generic TIFF parser
 * happens to handle it" approach.
 */
export const RAW_EXTENSIONS = [
  ".arw",
  ".cr2",
  ".cr3",
  ".nef",
  ".raf",
  ".rw2",
  ".orf",
  ".dng",
  ".pef",
  ".srw",
];

export function isRawExtension(fileName: string): boolean {
  const name = fileName.toLowerCase();
  return RAW_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function combineMakeAndModel(
  make: string | null | undefined,
  model: string | null | undefined,
): string | null {
  const m = make?.trim() || null;
  const mo = model?.trim() || null;
  if (!m) return mo;
  if (!mo) return m;
  if (mo.toLowerCase().startsWith(m.toLowerCase())) return mo;
  return `${m} ${mo}`;
}

/**
 * LibRaw's `timestamp` is a naive camera-clock value (no real timezone —
 * it's `mktime()` of the camera's local date/time fields) that libraw-wasm's
 * wrapper re-encodes as `new Date(epochSeconds * 1000)`. Reading it back with
 * the *UTC* getters recovers those original naive fields instead of shifting
 * them by whatever timezone this code happens to run in.
 */
function formatRawTakenDate(timestamp: Date | undefined): string | null {
  if (!timestamp || Number.isNaN(timestamp.getTime())) return null;
  const year = timestamp.getUTCFullYear();
  if (year <= 1970) return null; // LibRaw reports epoch 0 when no date is available
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart = `${year}-${pad(timestamp.getUTCMonth() + 1)}-${pad(timestamp.getUTCDate())}`;
  const timePart = `${pad(timestamp.getUTCHours())}:${pad(timestamp.getUTCMinutes())}:${pad(timestamp.getUTCSeconds())}`;
  return `${datePart} ${timePart}`;
}

/** Parses camera EXIF-equivalent metadata out of a RAW file via LibRaw. */
export async function parseRawExifFile(file: File): Promise<ParsedExif> {
  const { default: LibRaw } = await importLibRaw();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const raw = new LibRaw();
  try {
    await raw.open(bytes, {});
    let meta;
    try {
      meta = await raw.metadata(false);
    } catch {
      throw new Error("RAW 메타데이터를 읽는 중 오류가 발생했습니다");
    }
    if (!meta) {
      throw new Error("RAW 파일에서 메타데이터를 찾을 수 없습니다");
    }

    const camera = combineMakeAndModel(
      meta.normalized_make || meta.camera_make,
      meta.normalized_model || meta.camera_model,
    );
    const lens = meta.lens?.Lens?.trim() || meta.lens?.makernotes?.Lens?.trim() || null;
    const shutterSeconds =
      typeof meta.shutter === "number" && meta.shutter > 0 ? meta.shutter : null;
    const aperture =
      typeof meta.aperture === "number" && meta.aperture > 0
        ? `f/${meta.aperture.toFixed(1)}`
        : null;
    const iso =
      typeof meta.iso_speed === "number" && meta.iso_speed > 0
        ? String(Math.round(meta.iso_speed))
        : null;
    const focalLength =
      typeof meta.focal_len === "number" && meta.focal_len > 0
        ? `${Math.round(meta.focal_len)}mm`
        : null;

    return {
      fileName: file.name,
      camera,
      lens,
      shutterSpeedLabel: formatShutterSpeed(shutterSeconds),
      shutterSpeedSeconds: shutterSeconds,
      aperture,
      iso,
      focalLength,
      takenAt: formatRawTakenDate(meta.timestamp),
    };
  } finally {
    raw.dispose();
  }
}

/**
 * Extracts the JPEG preview most RAW files embed (the same image the
 * camera's LCD shows) as a `Blob`, for use as the EXIF Frame Generator's
 * photo source — no browser can decode raw sensor data directly, and a full
 * LibRaw demosaic is both far too slow for this use case and unnecessary
 * (the generator re-encodes to PNG/JPEG on export regardless).
 *
 * Returns `null` (never throws) when the file has no embedded preview, or
 * one in a format this doesn't know how to hand to `<img>` — callers should
 * treat that as "no preview available", not a hard failure.
 */
export async function extractRawPreviewBlob(file: File): Promise<Blob | null> {
  const { default: LibRaw } = await importLibRaw();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const raw = new LibRaw();
  try {
    await raw.open(bytes, {});
    const thumb = await raw.thumbnailData().catch(() => null);
    if (!thumb || !thumb.data || thumb.data.length === 0) return null;
    // Only a JPEG-format embedded thumbnail is directly usable as an <img>
    // source — 'bitmap'/'bitmap16'/'layer'/'rollei'/'h265' would need extra
    // decoding this doesn't implement, so treat those as "no preview" too.
    if (thumb.format !== "jpeg") return null;
    return new Blob([new Uint8Array(thumb.data)], { type: "image/jpeg" });
  } catch {
    return null;
  } finally {
    raw.dispose();
  }
}
