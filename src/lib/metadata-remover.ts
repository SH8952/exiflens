export type ImageMetadataFormat = "jpeg" | "png" | "webp";

export class MetadataRemovalError extends Error {}

export type MetadataRemovalOptions = {
  /**
   * Remove only GPS location data, keeping the rest of EXIF (camera, lens,
   * exposure settings, timestamp) intact. JPEG only — for PNG/WebP this is
   * ignored and full metadata removal always applies, since those formats
   * don't have a standard, separately-addressable GPS block the way JPEG's
   * EXIF does.
   */
  gpsOnly: boolean;
  /**
   * Also remove IPTC/Photoshop metadata (captions, keywords, copyright)
   * alongside EXIF/XMP. Default true — most users removing metadata for
   * privacy want everything gone, not just GPS/camera info.
   */
  removeIptc: boolean;
};

export function detectImageFormat(bytes: Uint8Array): ImageMetadataFormat | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 && // "RIFF"
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50 // "WEBP"
  ) {
    return "webp";
  }
  return null;
}

/** MIME type to use when rebuilding a File/Blob for a detected format. */
export function mimeTypeForFormat(format: ImageMetadataFormat): string {
  if (format === "jpeg") return "image/jpeg";
  if (format === "png") return "image/png";
  return "image/webp";
}

function concatRanges(bytes: Uint8Array, ranges: Array<[number, number]>): Uint8Array {
  let total = 0;
  for (const [start, end] of ranges) total += end - start;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const [start, end] of ranges) {
    out.set(bytes.subarray(start, end), pos);
    pos += end - start;
  }
  return out;
}

/**
 * Removes metadata segments from a JPEG file at the byte level, without
 * decoding/re-encoding the image — the pixel data (everything from the
 * Start-of-Scan marker onward) is copied through unchanged, so there is no
 * quality loss whatsoever, unlike a canvas re-export.
 *
 * Segments removed: APP1 (0xFFE1 — EXIF and/or XMP), APP13 (0xFFED —
 * Photoshop IRB, which carries IPTC), and COM (0xFFFE — free-text
 * comments), each independently toggleable. Everything else (APP0/JFIF,
 * APP2/ICC color profile, quantization/Huffman tables, image data, etc.)
 * is kept as-is so colors and compression stay identical.
 */
export function stripJpegSegments(
  bytes: Uint8Array,
  opts: { removeApp1: boolean; removeApp13: boolean; removeCom: boolean },
): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new MetadataRemovalError("Not a valid JPEG file (missing SOI marker).");
  }

  const keepRanges: Array<[number, number]> = [[0, 2]];
  let offset = 2;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      keepRanges.push([offset, bytes.length]);
      break;
    }
    const marker = bytes[offset + 1];

    if (marker === 0xd9) {
      keepRanges.push([offset, Math.min(offset + 2, bytes.length)]);
      break;
    }
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      keepRanges.push([offset, offset + 2]);
      offset += 2;
      continue;
    }
    if (marker === 0xda) {
      // Start of Scan — copy the rest of the file (scan header + entropy-coded data + EOI) untouched.
      keepRanges.push([offset, bytes.length]);
      break;
    }
    if (offset + 4 > bytes.length) {
      keepRanges.push([offset, bytes.length]);
      break;
    }

    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const segmentEnd = Math.min(offset + 2 + length, bytes.length);
    const drop =
      (opts.removeApp1 && marker === 0xe1) ||
      (opts.removeApp13 && marker === 0xed) ||
      (opts.removeCom && marker === 0xfe);

    if (!drop) keepRanges.push([offset, segmentEnd]);
    offset = segmentEnd;
  }

  return concatRanges(bytes, keepRanges);
}

const BINARY_CHUNK_SIZE = 0x8000;

function bytesToBinaryString(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i += BINARY_CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + BINARY_CHUNK_SIZE);
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return result;
}

function binaryStringToBytes(binary: string): Uint8Array {
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/**
 * Removes only the GPS IFD from a JPEG's EXIF data (via piexifjs), leaving
 * every other EXIF tag (camera, lens, exposure settings, timestamp) intact.
 *
 * Caveat surfaced in the UI: some editing tools also mirror GPS
 * coordinates into an XMP block inside a separate APP1 segment. This
 * function only touches the standard EXIF GPS IFD, so a file with
 * XMP-embedded GPS data could still carry location info afterward — the
 * full-removal mode is the only way to guarantee no GPS data survives.
 */
export async function removeGpsOnlyFromJpeg(bytes: Uint8Array): Promise<Uint8Array> {
  // Loaded lazily (dynamic import), matching how exifreader is loaded
  // elsewhere in this codebase — piexifjs is only needed once someone
  // actually uses the "GPS only" option, not on every page load.
  const { default: piexif } = await import("piexifjs");

  const binary = bytesToBinaryString(bytes);
  let exifObj: Record<string, unknown>;
  try {
    exifObj = piexif.load(binary);
  } catch {
    // No parseable EXIF segment — nothing to strip.
    return bytes;
  }

  const gps = exifObj.GPS as Record<string, unknown> | undefined;
  if (!gps || Object.keys(gps).length === 0) {
    return bytes;
  }

  exifObj.GPS = {};
  const exifBytes = piexif.dump(exifObj);
  const newBinary = piexif.insert(exifBytes, binary);
  return binaryStringToBytes(newBinary);
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0
  );
}

const PNG_REMOVABLE_CHUNK_TYPES = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME"]);

/**
 * Removes metadata-carrying ancillary chunks from a PNG (tEXt/zTXt/iTXt
 * text chunks — which is also where IPTC and XMP end up when embedded in
 * a PNG — the dedicated eXIf chunk, and the tIME last-modified chunk).
 * Pixel data (IDAT) and color-management chunks (iCCP/gAMA/cHRM/sRGB) are
 * left untouched, so there's no quality or color loss.
 */
export function stripPngChunks(bytes: Uint8Array): Uint8Array {
  const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 8 || !SIGNATURE.every((b, i) => bytes[i] === b)) {
    throw new MetadataRemovalError("Not a valid PNG file (missing signature).");
  }

  const keepRanges: Array<[number, number]> = [[0, 8]];
  let offset = 8;

  while (offset + 8 <= bytes.length) {
    const length = readUint32BE(bytes, offset);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );
    const chunkTotal = 12 + length; // length(4) + type(4) + data(length) + crc(4)
    const chunkEnd = Math.min(offset + chunkTotal, bytes.length);

    if (!PNG_REMOVABLE_CHUNK_TYPES.has(type)) {
      keepRanges.push([offset, chunkEnd]);
    }

    offset = chunkEnd;
    if (type === "IEND" || chunkTotal <= 0) break;
  }

  return concatRanges(bytes, keepRanges);
}

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

const WEBP_REMOVABLE_CHUNKS = new Set(["EXIF", "XMP "]);

/**
 * Removes the EXIF and XMP RIFF sub-chunks from a WebP file, clearing the
 * corresponding feature-flag bits in the VP8X header (when present) and
 * fixing up the overall RIFF size field. "Simple" (non-extended) WebP
 * files never carry these chunks at all, so they pass through unchanged.
 */
export function stripWebpChunks(bytes: Uint8Array): Uint8Array {
  if (
    bytes.length < 12 ||
    bytes[0] !== 0x52 ||
    bytes[1] !== 0x49 ||
    bytes[2] !== 0x46 ||
    bytes[3] !== 0x46 ||
    bytes[8] !== 0x57 ||
    bytes[9] !== 0x45 ||
    bytes[10] !== 0x42 ||
    bytes[11] !== 0x50
  ) {
    throw new MetadataRemovalError("Not a valid WebP file (missing RIFF/WEBP header).");
  }

  type Chunk = { fourCC: string; start: number; end: number };
  const chunks: Chunk[] = [];
  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const fourCC = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
    const dataLength = readUint32LE(bytes, offset + 4);
    const dataStart = offset + 8;
    const padded = dataLength % 2 === 1 ? dataLength + 1 : dataLength;
    const end = Math.min(dataStart + padded, bytes.length);
    chunks.push({ fourCC, start: offset, end });
    if (end <= offset) break; // guard against a corrupt zero-progress chunk
    offset = end;
  }

  const keptChunks = chunks.filter((c) => !WEBP_REMOVABLE_CHUNKS.has(c.fourCC));
  const keptTotalLength = keptChunks.reduce((sum, c) => sum + (c.end - c.start), 0);
  const out = new Uint8Array(12 + keptTotalLength);
  out.set(bytes.subarray(0, 12), 0);

  let pos = 12;
  for (const c of keptChunks) {
    const chunkBytes = bytes.subarray(c.start, c.end);
    if (c.fourCC === "VP8X") {
      const copy = new Uint8Array(chunkBytes);
      const flagsIndex = 8; // 4 (FourCC) + 4 (size) = start of VP8X's data payload; its first byte holds the feature flags.
      // Clear the EXIF (0x08) and XMP (0x04) presence bits now that those chunks are gone.
      copy[flagsIndex] = copy[flagsIndex] & ~0x08 & ~0x04;
      out.set(copy, pos);
    } else {
      out.set(chunkBytes, pos);
    }
    pos += c.end - c.start;
  }

  const view = new DataView(out.buffer);
  view.setUint32(4, out.length - 8, true);

  return out;
}

/**
 * Removes metadata from a single image file entirely in the browser (the
 * file's bytes never leave the client) and returns a new Blob with the
 * same MIME type. Returns null for a format this tool doesn't support.
 */
export async function removeMetadataFromFile(
  file: File,
  options: MetadataRemovalOptions,
): Promise<{ blob: Blob; format: ImageMetadataFormat } | null> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const format = detectImageFormat(bytes);
  if (!format) return null;

  let result: Uint8Array;
  if (format === "jpeg") {
    if (options.gpsOnly) {
      const gpsStripped = await removeGpsOnlyFromJpeg(bytes);
      result = stripJpegSegments(gpsStripped, {
        removeApp1: false,
        removeApp13: options.removeIptc,
        removeCom: true,
      });
    } else {
      result = stripJpegSegments(bytes, {
        removeApp1: true,
        removeApp13: options.removeIptc,
        removeCom: true,
      });
    }
  } else if (format === "png") {
    result = stripPngChunks(bytes);
  } else {
    result = stripWebpChunks(bytes);
  }

  // `result`'s buffer is typed ArrayBufferLike (not exactly ArrayBuffer) by
  // TypeScript's typed-array generics, which BlobPart doesn't accept — copy
  // out exactly the view's bytes into a fresh, unambiguous ArrayBuffer.
  const resultBuffer = result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength) as ArrayBuffer;
  return { blob: new Blob([resultBuffer], { type: mimeTypeForFormat(format) }), format };
}
