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
 * So this module parses the file's raw TIFF/Exif byte structure itself,
 * scoped to Nikon in this first version — the one brand where the exact
 * on-disk layout is unambiguous and independently confirmed (see below).
 *
 * Nikon MakerNote ("Type 3") structure, per multiple independent public
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
 * Verified end-to-end (2026-09-28): running this exact algorithm against the
 * exiftool project's own public Nikon.nef test file returns 3619, which
 * matches `exiftool -ShutterCount` on the same file exactly.
 */

export type ShutterCountBrand = "nikon" | "canon" | "sony" | "fujifilm" | "olympus" | "panasonic" | "pentax" | "unknown";

export type ShutterCountResult =
  | { supported: true; brand: "nikon"; shutterCount: number; cameraModel: string | null }
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

/**
 * Reads the shutter/actuation count from a Nikon NEF or in-camera JPEG file,
 * entirely client-side (the file's bytes never leave the browser). Every
 * other brand currently returns `{ supported: false }` with an honest
 * explanation — see the module doc comment for why, and
 * `content/guides/<locale>/shutter-count-checker-guide.mdx` for the full supported-
 * brand roadmap shown to users.
 */
export async function checkShutterCount(file: File): Promise<ShutterCountResult> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

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
    return {
      supported: false,
      brand,
      cameraModel,
      reason:
        brand === "unknown"
          ? "카메라 제조사를 확인할 수 없습니다."
          : "이 브랜드는 아직 지원되지 않습니다.",
    };
  }

  const exifPtrEntry = findEntry(ifd0, 0x8769);
  if (!exifPtrEntry) {
    return {
      supported: false,
      brand,
      cameraModel,
      reason: "이 파일에서 Exif 서브 IFD를 찾을 수 없습니다.",
    };
  }
  const exifIfdOffset = tiffStart + readOffsetValue(view, exifPtrEntry, outerLE);
  const exifIfd = readIfdEntries(view, exifIfdOffset, outerLE);

  const makerNoteEntry = findEntry(exifIfd, 0x927c);
  if (!makerNoteEntry) {
    return {
      supported: false,
      brand,
      cameraModel,
      reason: "이 파일에는 MakerNote(제조사 확장 메타데이터)가 없습니다.",
    };
  }
  const mnSize = (TYPE_SIZES[makerNoteEntry.type] ?? 1) * makerNoteEntry.numValues;
  const makerNoteOffset =
    mnSize <= 4
      ? tiffStart + makerNoteEntry.valueFieldOffset - tiffStart // inline (rare/unused for MakerNote, kept for completeness)
      : tiffStart + view.getUint32(makerNoteEntry.valueFieldOffset, outerLE);

  if (makerNoteOffset + 10 > view.byteLength) {
    return {
      supported: false,
      brand,
      cameraModel,
      reason: "MakerNote 데이터가 손상되었거나 잘려 있습니다.",
    };
  }

  const sig = new TextDecoder("latin1").decode(
    new Uint8Array(view.buffer, view.byteOffset + makerNoteOffset, 6),
  );
  if (!sig.startsWith("Nikon")) {
    return {
      supported: false,
      brand,
      cameraModel,
      reason: "이 니콘 모델의 MakerNote 구조가 아직 지원되지 않습니다.",
    };
  }

  // 6-byte "Nikon\0" + 2-byte version + 2-byte unknown = 10 bytes, then a
  // brand-new inner TIFF header whose own offsets are relative to ITS start.
  const innerBase = makerNoteOffset + 10;
  const innerBom = String.fromCharCode(view.getUint8(innerBase), view.getUint8(innerBase + 1));
  if (innerBom !== "II" && innerBom !== "MM") {
    return {
      supported: false,
      brand,
      cameraModel,
      reason: "이 니콘 모델의 MakerNote 구조가 아직 지원되지 않습니다.",
    };
  }
  const innerLE = innerBom === "II";
  const innerIfdOffset = innerBase + view.getUint32(innerBase + 4, innerLE);
  const innerIfd = readIfdEntries(view, innerIfdOffset, innerLE);

  const shutterCountEntry = findEntry(innerIfd, 0x00a7);
  if (!shutterCountEntry) {
    return {
      supported: false,
      brand,
      cameraModel,
      reason: "이 파일에서 셔터카운트 값을 찾을 수 없습니다.",
    };
  }

  const shutterCount = readUintValue(view, shutterCountEntry, innerBase, innerLE);
  return { supported: true, brand: "nikon", shutterCount, cameraModel };
}

/** File extensions/MIME types this checker's UI accepts. */
export const SHUTTER_COUNT_ACCEPTED_EXTENSIONS = [".nef", ".jpg", ".jpeg"];
export const SHUTTER_COUNT_FILE_ACCEPT = "image/jpeg,.nef";
