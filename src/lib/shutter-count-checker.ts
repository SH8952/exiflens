/**
 * Camera shutter count (total shutter actuations) reader.
 *
 * Neither of ExifLens's existing metadata libraries expose this value:
 * `exifreader` never parses brand-specific MakerNote fields at all, and
 * `libraw-wasm` (used for every RAW extension — see `@/lib/raw-exif`)
 * decodes MakerNote data into named fields per brand but does not surface a
 * shutter-count/actuation-count field for any brand in its wrapper output
 * (confirmed 2026-09-28 by running real exiftool-project test RAW files
 * — Nikon.nef/CanonRaw.cr2/CanonRaw.cr3/FujiFilm.raf/a Sony .ARW — through
 * `metadata(true)` directly: no field in the returned `nikon`/`canon`/
 * `fuji`/`sony` blocks corresponds to lifetime shutter actuations).
 *
 * So this module parses the file's raw TIFF/Exif (and, for Canon CR3, the
 * ISO-BMFF container) byte structure itself. Two brands are supported so
 * far, each independently verified before shipping — see the two doc
 * comments below (Nikon, then Canon) for exactly what was confirmed and
 * how. Every other brand returns `{ supported: false }` with an honest
 * explanation; see `content/guides/<locale>/shutter-count-checker-guide.mdx`
 * for the roadmap shown to users, and the brand-by-brand research notes in
 * CHANGELOG.md (2026-09-28 entries) for why each of those is harder than it
 * looks and isn't a simple next step.
 *
 * --- Nikon ---
 * MakerNote ("Type 3") structure, per multiple independent public
 * references (ozhiker.com's Nikon MakerNote spec; the MIT-licensed
 * evanoberholster/imagemeta Go library's Nikon parser; exiftool.org's public
 * Nikon tag table — none of which is exiftool's own source code, only the
 * documented byte layout, which several independent open implementations
 * agree on):
 *
 *   [Exif MakerNote tag 0x927C's value bytes]
 *     "Nikon\0"      6 bytes  — signature
 *     version        2 bytes
 *     unknown        2 bytes
 *     ---- a brand-new inner TIFF header starts here ----
 *     byte-order mark "II"/"MM"   2 bytes
 *     magic 42                    2 bytes
 *     offset to inner IFD0        4 bytes  (relative to the inner header's
 *                                            OWN start position, NOT the
 *                                            outer file's TIFF header — this
 *                                            is the detail that silently
 *                                            produces garbage if missed)
 *
 * Inside that inner IFD, tag 0x00A7 (167) is `ShutterCount`, stored as a
 * plain (unencrypted) `int32u` — exiftool.org's Nikon tag documentation
 * notes that `ShutterCount`'s own value is used as a key to decrypt OTHER
 * Nikon fields (lens data etc.), not that this field's own value is itself
 * encrypted. Reading it needs no decryption.
 *
 * Verified end-to-end (2026-09-28): running this exact algorithm against
 * exiftool's own public Nikon.nef AND NikonD70.jpg test files returns 3619
 * and 526 respectively, matching `exiftool -ShutterCount` on the same files
 * exactly.
 *
 * --- Canon (CR3 / EOS R mirrorless only) ---
 * Unlike Nikon, Canon has no single formula: `ShutterCount` sits at a
 * different fixed byte offset inside a per-model opaque binary block
 * (`CameraInfo`) for every camera family, and that offset has to be
 * reverse-engineered and published separately for each one. As of this
 * writing that offset is publicly documented for:
 *   - EOS R5 and EOS R6 — same offset, 0x0AF1 (exiftool's public Canon tag
 *     table, citing forum threads #15210/#15579).
 *   - EOS R6 Mark II, EOS R8, and EOS R50 — same offset, 0x0D29 (exiftool's
 *     public Canon tag table, citing forum contributor AgostonKapitany).
 *     These three share one offset in the same upstream record, so
 *     supporting R6 Mark II (the model actually requested) means R8/R50
 *     come along for free from the identical, equally-documented mapping —
 *     not a separate guess on our part.
 * Every other Canon body — the R7, R10, R3, R1, R5 Mark II, R6 Mark III,
 * and every CR2-era DSLR — has no known offset published anywhere yet
 * (checked directly against exiftool's current (13.59) Canon tag table,
 * not just the older locally-installed 12.76), so those still return the
 * same honest "not supported yet" result as any other unmapped Canon body,
 * old or new.
 *
 * CR3 isn't TIFF at all — it's an ISO-BMFF (MP4-family) container. Canon
 * wraps the classic TIFF-structured Exif/MakerNote data (the same data a
 * CR2/JPEG carries directly) inside four sequential boxes named CMT1–CMT4,
 * nested inside one outer `uuid` box (identified by the fixed extension id
 * `85c0b687-820f-11e0-8111-f4ce462b6a48`) that itself lives inside `moov`.
 * CMT1 is a self-contained IFD0 (Make/Model, etc.); CMT3 is a
 * self-contained MakerNote IFD (Canon's classic tag 0x000d `CameraInfo`
 * blob lives directly in it, with no Exif-pointer indirection needed).
 * Verified 2026-09-28 by walking exiftool's own public CanonRaw.cr3 test
 * file byte-for-byte: CMT1–CMT4 are exactly where the box sizes say they
 * are, and CMT3's payload starts with a valid "II*\0" TIFF header whose
 * IFD0 entries are the ordinary Canon MakerNote tags. That confirms the
 * container-extraction mechanism end-to-end. What could NOT be verified
 * end-to-end (no real EOS R5/R6 file was available to test against) is the
 * final 0x0AF1 offset itself — that one fact is taken from exiftool's
 * public tag documentation rather than independently re-derived, unlike
 * every other fact this module relies on.
 */

export type ShutterCountBrand = "nikon" | "canon" | "sony" | "fujifilm" | "olympus" | "panasonic" | "pentax" | "unknown";

export type ShutterCountResult =
  | { supported: true; brand: "nikon" | "canon"; shutterCount: number; cameraModel: string | null }
  | { supported: false; brand: ShutterCountBrand; cameraModel: string | null; reason: string };

export class ShutterCountParseError extends Error {}

const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

type IfdEntry = {
  tag: number;
  type: number;
  numValues: number;
  valueFieldOffset: number;
};

function readIfdEntries(view: DataView, ifdOffset: number, littleEndian: boolean): IfdEntry[] {
  const count = view.getUint16(ifdOffset, littleEndian);
  const entries: IfdEntry[] = [];
  for (let i = 0; i < count; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;
    entries.push({
      tag: view.getUint16(entryOffset, littleEndian),
      type: view.getUint16(entryOffset + 2, littleEndian),
      numValues: view.getUint32(entryOffset + 4, littleEndian),
      valueFieldOffset: entryOffset + 8,
    });
  }
  return entries;
}

function findEntry(entries: IfdEntry[], tag: number): IfdEntry | undefined {
  return entries.find((e) => e.tag === tag);
}

function readUintValue(view: DataView, entry: IfdEntry, base: number, littleEndian: boolean): number {
  const size = (TYPE_SIZES[entry.type] ?? 1) * entry.numValues;
  const off = size <= 4 ? entry.valueFieldOffset : base + view.getUint32(entry.valueFieldOffset, littleEndian);
  if (entry.type === 3) return view.getUint16(off, littleEndian);
  return view.getUint32(off, littleEndian);
}

function readOffsetValue(view: DataView, entry: IfdEntry, littleEndian: boolean): number {
  // For pointer-type tags (ExifIFD, MakerNote) the stored 4-byte value IS the
  // offset itself (never inline elsewhere), regardless of `type`.
  return view.getUint32(entry.valueFieldOffset, littleEndian);
}

function readAsciiValue(view: DataView, entry: IfdEntry, base: number, littleEndian: boolean): string | null {
  if (entry.type !== 2) return null;
  const size = entry.numValues;
  const off = size <= 4 ? entry.valueFieldOffset : base + view.getUint32(entry.valueFieldOffset, littleEndian);
  const bytes = new Uint8Array(view.buffer, view.byteOffset + off, size);
  let end = bytes.indexOf(0);
  if (end === -1) end = bytes.length;
  return new TextDecoder("latin1").decode(bytes.subarray(0, end)).trim();
}

/** Returns the blob's (offset, length) in the view for an offset-type IFD entry (e.g. a MakerNote or CameraInfo tag). */
function readBlobLocation(
  view: DataView,
  entry: IfdEntry,
  base: number,
  littleEndian: boolean,
): { offset: number; length: number } {
  const length = (TYPE_SIZES[entry.type] ?? 1) * entry.numValues;
  const offset = length <= 4 ? entry.valueFieldOffset : base + view.getUint32(entry.valueFieldOffset, littleEndian);
  return { offset, length };
}

/** Locates the start of TIFF-structured Exif data inside a JPEG (APP1 "Exif\0\0" segment). */
function findJpegExifTiffOffset(view: DataView): number | null {
  if (view.getUint16(0) !== 0xffd8) return null; // not a JPEG
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00) break;
    if (marker === 0xffd9 || marker === 0xffda) break; // EOI / start-of-scan — no more markers
    const segmentLength = view.getUint16(offset + 2);
    if (marker === 0xffe1 && offset + 4 + 6 <= view.byteLength) {
      const sig = new TextDecoder("latin1").decode(
        new Uint8Array(view.buffer, view.byteOffset + offset + 4, 6),
      );
      if (sig === "Exif\0\0") return offset + 4 + 6;
    }
    offset += 2 + segmentLength;
  }
  return null;
}

function brandFromMake(make: string | null): ShutterCountBrand {
  const m = (make ?? "").toUpperCase();
  if (m.includes("NIKON")) return "nikon";
  if (m.includes("CANON")) return "canon";
  if (m.includes("SONY")) return "sony";
  if (m.includes("FUJI")) return "fujifilm";
  if (m.includes("OLYMPUS") || m.includes("OM DIGITAL")) return "olympus";
  if (m.includes("PANASONIC")) return "panasonic";
  if (m.includes("PENTAX") || m.includes("RICOH")) return "pentax";
  return "unknown";
}

type UnsupportedResult = Extract<ShutterCountResult, { supported: false }>;

function unsupported(
  brand: ShutterCountBrand,
  cameraModel: string | null,
  reason: string,
): UnsupportedResult {
  return { supported: false, brand, cameraModel, reason };
}

// ---------------------------------------------------------------------------
// ISO-BMFF (MP4-family) box walking — needed only for Canon CR3.
// ---------------------------------------------------------------------------

type Box = { type: string; start: number; payloadStart: number; end: number };

/** Walks the immediate child boxes of `[start, end)` in standard ISO-BMFF [size(4)][type(4)][payload] form. */
function readChildBoxes(view: DataView, start: number, end: number): Box[] {
  const boxes: Box[] = [];
  let pos = start;
  while (pos + 8 <= end) {
    let size = view.getUint32(pos, false); // ISO-BMFF box sizes are always big-endian
    const type = new TextDecoder("latin1").decode(
      new Uint8Array(view.buffer, view.byteOffset + pos + 4, 4),
    );
    let payloadStart = pos + 8;
    if (size === 1) {
      // 64-bit "largesize" extension
      const hi = view.getUint32(pos + 8, false);
      const lo = view.getUint32(pos + 12, false);
      size = hi * 2 ** 32 + lo;
      payloadStart = pos + 16;
    } else if (size === 0) {
      size = end - pos; // box extends to the end of its parent
    }
    if (size < 8 || pos + size > end) break;
    boxes.push({ type, start: pos, payloadStart, end: pos + size });
    pos += size;
  }
  return boxes;
}

function findChildBox(view: DataView, start: number, end: number, type: string): Box | undefined {
  return readChildBoxes(view, start, end).find((b) => b.type === type);
}

/** The fixed 16-byte extension id Canon uses for its CR3 metadata `uuid` box (verified against a real CR3 file, 2026-09-28). */
const CANON_CR3_UUID_HEX = "85c0b687820f11e08111f4ce462b6a48";

function findCanonCr3InfoBoxes(view: DataView): { cmt1: Box; cmt3: Box } | null {
  const ftypBox = findChildBox(view, 0, view.byteLength, "ftyp");
  if (!ftypBox) return null;
  const topBoxes = readChildBoxes(view, 0, view.byteLength);
  const moov = topBoxes.find((b) => b.type === "moov");
  if (!moov) return null;
  const moovChildren = readChildBoxes(view, moov.payloadStart, moov.end);
  const infoUuid = moovChildren.find((b) => {
    if (b.type !== "uuid") return false;
    const ext = new Uint8Array(view.buffer, view.byteOffset + b.payloadStart, 16);
    const hex = Array.from(ext, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return hex === CANON_CR3_UUID_HEX;
  });
  if (!infoUuid) return null;
  // The uuid box's payload is [16-byte extension id][sequential child boxes: CNCV, CCTP, CTBO, CMT1..CMT4, THMB].
  const innerStart = infoUuid.payloadStart + 16;
  const innerChildren = readChildBoxes(view, innerStart, infoUuid.end);
  const cmt1 = innerChildren.find((b) => b.type === "CMT1");
  const cmt3 = innerChildren.find((b) => b.type === "CMT3");
  if (!cmt1 || !cmt3) return null;
  return { cmt1, cmt3 };
}

/** Reads Make/Model out of a self-contained mini-TIFF (used for CR3's CMT1 box, which is exactly IFD0). */
function readMakeModelFromMiniTiff(
  view: DataView,
  tiffStart: number,
): { make: string | null; model: string | null } | null {
  if (tiffStart + 8 > view.byteLength) return null;
  const bom = String.fromCharCode(view.getUint8(tiffStart), view.getUint8(tiffStart + 1));
  if (bom !== "II" && bom !== "MM") return null;
  const littleEndian = bom === "II";
  const ifdOffset = tiffStart + view.getUint32(tiffStart + 4, littleEndian);
  const ifd = readIfdEntries(view, ifdOffset, littleEndian);
  const makeEntry = findEntry(ifd, 0x010f);
  const modelEntry = findEntry(ifd, 0x0110);
  return {
    make: makeEntry ? readAsciiValue(view, makeEntry, tiffStart, littleEndian) : null,
    model: modelEntry ? readAsciiValue(view, modelEntry, tiffStart, littleEndian) : null,
  };
}

/** Canon body families with a publicly documented `CameraInfo` ShutterCount byte offset (see module doc comment). */
const CANON_CAMERA_INFO_SHUTTER_COUNT: { modelPattern: RegExp; byteOffset: number }[] = [
  { modelPattern: /\bEOS R[56]$/, byteOffset: 0x0af1 },
  // Model tag's raw internal string for these three bodies is "R6m2", not
  // the marketing name "R6 Mark II" — matches exiftool's own condition
  // exactly, since that's what actually appears in real files' Model tag.
  { modelPattern: /\bEOS (R6m2|R8|R50)$/, byteOffset: 0x0d29 },
];

function parseCanonCr3ShutterCount(view: DataView): ShutterCountResult {
  const boxes = findCanonCr3InfoBoxes(view);
  if (!boxes) {
    return unsupported("canon", null, "이 CR3 파일의 구조를 인식할 수 없습니다.");
  }
  const idInfo = readMakeModelFromMiniTiff(view, boxes.cmt1.payloadStart);
  const cameraModel = idInfo?.model ?? null;

  const mnBom = String.fromCharCode(
    view.getUint8(boxes.cmt3.payloadStart),
    view.getUint8(boxes.cmt3.payloadStart + 1),
  );
  if (mnBom !== "II" && mnBom !== "MM") {
    return unsupported("canon", cameraModel, "이 캐논 모델은 아직 지원되지 않습니다.");
  }
  const mnLE = mnBom === "II";
  const mnIfdOffset = boxes.cmt3.payloadStart + view.getUint32(boxes.cmt3.payloadStart + 4, mnLE);
  const makerNoteIfd = readIfdEntries(view, mnIfdOffset, mnLE);

  const cameraInfoEntry = findEntry(makerNoteIfd, 0x000d);
  const mapping = CANON_CAMERA_INFO_SHUTTER_COUNT.find((m) => cameraModel && m.modelPattern.test(cameraModel));
  if (!cameraInfoEntry || !mapping) {
    return unsupported("canon", cameraModel, "이 캐논 모델은 아직 지원되지 않습니다.");
  }

  const blob = readBlobLocation(view, cameraInfoEntry, boxes.cmt3.payloadStart, mnLE);
  if (mapping.byteOffset + 4 > blob.length) {
    return unsupported("canon", cameraModel, "이 캐논 모델은 아직 지원되지 않습니다.");
  }
  const shutterCount = view.getUint32(blob.offset + mapping.byteOffset, mnLE);
  return { supported: true, brand: "canon", shutterCount, cameraModel };
}

/**
 * Reads the shutter/actuation count from a supported camera file, entirely
 * client-side (the file's bytes never leave the browser). Supported today:
 * Nikon (NEF / in-camera JPEG) and Canon EOS R5, R6, R6 Mark II, R8, and R50
 * (CR3 only). Every other brand or model returns `{ supported: false }` with
 * an honest explanation
 * — see the module doc comment for why, and
 * `content/guides/<locale>/shutter-count-checker-guide.mdx` for the full
 * supported-brand roadmap shown to users.
 */
export async function checkShutterCount(file: File): Promise<ShutterCountResult> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  // Canon CR3 is an ISO-BMFF container, not a bare TIFF/JPEG — handled by an
  // entirely separate path before the generic TIFF sniff below.
  if (view.byteLength >= 12) {
    const type = new TextDecoder("latin1").decode(new Uint8Array(buffer, 4, 4));
    if (type === "ftyp") {
      return parseCanonCr3ShutterCount(view);
    }
  }

  let tiffStart: number;
  if (view.byteLength >= 2 && view.getUint16(0) === 0xffd8) {
    const found = findJpegExifTiffOffset(view);
    if (found === null) {
      throw new ShutterCountParseError("이 JPEG 파일에는 EXIF 데이터가 없습니다.");
    }
    tiffStart = found;
  } else {
    tiffStart = 0;
  }

  if (tiffStart + 8 > view.byteLength) {
    throw new ShutterCountParseError("파일 구조를 인식할 수 없습니다.");
  }

  const bom = String.fromCharCode(view.getUint8(tiffStart), view.getUint8(tiffStart + 1));
  if (bom !== "II" && bom !== "MM") {
    throw new ShutterCountParseError("지원되지 않는 파일 형식입니다.");
  }
  const outerLE = bom === "II";

  // All offsets inside the outer TIFF structure (IFD0, ExifIFD) are relative
  // to `tiffStart` — a JPEG's embedded TIFF header does not start at file
  // offset 0 the way a bare NEF/TIFF file does.
  const ifd0Offset = tiffStart + view.getUint32(tiffStart + 4, outerLE);
  const ifd0 = readIfdEntries(view, ifd0Offset, outerLE);

  const makeEntry = findEntry(ifd0, 0x010f);
  const modelEntry = findEntry(ifd0, 0x0110);
  const make = makeEntry ? readAsciiValue(view, makeEntry, tiffStart, outerLE) : null;
  const cameraModel = modelEntry ? readAsciiValue(view, modelEntry, tiffStart, outerLE) : null;
  const brand = brandFromMake(make);

  if (brand !== "nikon") {
    return unsupported(
      brand,
      cameraModel,
      brand === "unknown" ? "카메라 제조사를 확인할 수 없습니다." : "이 브랜드는 아직 지원되지 않습니다.",
    );
  }

  const exifPtrEntry = findEntry(ifd0, 0x8769);
  if (!exifPtrEntry) {
    return unsupported(brand, cameraModel, "이 파일에서 Exif 서브 IFD를 찾을 수 없습니다.");
  }
  const exifIfdOffset = tiffStart + readOffsetValue(view, exifPtrEntry, outerLE);
  const exifIfd = readIfdEntries(view, exifIfdOffset, outerLE);

  const makerNoteEntry = findEntry(exifIfd, 0x927c);
  if (!makerNoteEntry) {
    return unsupported(brand, cameraModel, "이 파일에는 MakerNote(제조사 확장 메타데이터)가 없습니다.");
  }
  const makerNoteBlob = readBlobLocation(view, makerNoteEntry, tiffStart, outerLE);
  const makerNoteOffset = makerNoteBlob.offset;

  if (makerNoteOffset + 10 > view.byteLength) {
    return unsupported(brand, cameraModel, "MakerNote 데이터가 손상되었거나 잘려 있습니다.");
  }

  const sig = new TextDecoder("latin1").decode(
    new Uint8Array(view.buffer, view.byteOffset + makerNoteOffset, 6),
  );
  if (!sig.startsWith("Nikon")) {
    return unsupported(brand, cameraModel, "이 니콘 모델의 MakerNote 구조가 아직 지원되지 않습니다.");
  }

  // 6-byte "Nikon\0" + 2-byte version + 2-byte unknown = 10 bytes, then a
  // brand-new inner TIFF header whose own offsets are relative to ITS start.
  const innerBase = makerNoteOffset + 10;
  const innerBom = String.fromCharCode(view.getUint8(innerBase), view.getUint8(innerBase + 1));
  if (innerBom !== "II" && innerBom !== "MM") {
    return unsupported(brand, cameraModel, "이 니콘 모델의 MakerNote 구조가 아직 지원되지 않습니다.");
  }
  const innerLE = innerBom === "II";
  const innerIfdOffset = innerBase + view.getUint32(innerBase + 4, innerLE);
  const innerIfd = readIfdEntries(view, innerIfdOffset, innerLE);

  const shutterCountEntry = findEntry(innerIfd, 0x00a7);
  if (!shutterCountEntry) {
    return unsupported(brand, cameraModel, "이 파일에서 셔터카운트 값을 찾을 수 없습니다.");
  }

  const shutterCount = readUintValue(view, shutterCountEntry, innerBase, innerLE);
  return { supported: true, brand: "nikon", shutterCount, cameraModel };
}

/** File extensions/MIME types this checker's UI accepts. */
export const SHUTTER_COUNT_ACCEPTED_EXTENSIONS = [".nef", ".jpg", ".jpeg", ".cr3"];
export const SHUTTER_COUNT_FILE_ACCEPT = "image/jpeg,.nef,.cr3";
