/**
 * 이미지 편집·변환 도구 공통 라이브러리 (압축 / 크기 조절 / 변환 / 자르기·회전 /
 * 워터마크 / 모자이크). 모든 처리는 브라우저의 Canvas 안에서 이루어지며 이미지는
 * 서버로 전송되지 않는다.
 *
 * 핵심 규칙
 * - 디코딩 시 EXIF 회전(Orientation)을 적용해 그린다. 따라서 결과 이미지는 항상
 *   "보이는 방향 그대로"의 픽셀이고, EXIF를 유지할 때는 Orientation을 1로 되돌려
 *   이중 회전이 생기지 않게 한다.
 * - Canvas로 다시 저장하면 EXIF/GPS/IPTC는 기본적으로 사라진다. JPEG에 한해
 *   piexifjs로 원본 EXIF를 다시 넣을 수 있다 (옵션).
 */

export type OutputMime = "image/jpeg" | "image/png" | "image/webp";

export type LoadedImage = {
  source: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  /** 사용이 끝나면 호출해 메모리를 돌려준다. */
  dispose: () => void;
};

export class ImageToolError extends Error {}

export function extensionForMime(mime: OutputMime): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return "webp";
}

/** 파일명 뒤에 접미사를 붙이고 확장자를 바꾼다. (예: photo.jpg → photo-compressed.webp) */
export function buildOutputName(
  fileName: string,
  suffix: string,
  mime: OutputMime,
): string {
  const dot = fileName.lastIndexOf(".");
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  return `${base}${suffix}.${extensionForMime(mime)}`;
}

export function mimeFromBytes(bytes: Uint8Array): OutputMime | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/** 파일의 실제 형식(확장자가 아니라 내용 기준)을 JPEG/PNG/WebP 중에서 판별. */
export async function sniffMime(file: Blob): Promise<OutputMime | null> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return mimeFromBytes(head);
}

export async function loadImage(blob: Blob): Promise<LoadedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        dispose: () => bitmap.close(),
      };
    } catch {
      // 일부 브라우저/형식에서 옵션을 거부 — 아래 <img> 경로로 대체
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      dispose: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new ImageToolError("decode-failed");
  }
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

export function get2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageToolError("canvas-unavailable");
  return ctx;
}

/** 브라우저 캔버스가 허용하는 한도(대략 한 변 16384px / 면적 2.68억 px). */
export const MAX_CANVAS_SIDE = 16384;
export const MAX_CANVAS_AREA = 268_000_000;

export function assertCanvasSize(width: number, height: number): void {
  if (
    width > MAX_CANVAS_SIDE ||
    height > MAX_CANVAS_SIDE ||
    width * height > MAX_CANVAS_AREA
  ) {
    throw new ImageToolError("too-large");
  }
}

/**
 * 원본을 (width × height)로 그린 캔버스를 만든다. 1/2 이하로 줄일 때는 한 번에
 * 줄이면 계단·앨리어싱이 생기므로 절반씩 여러 번 줄여 품질을 지킨다.
 * JPEG처럼 투명도가 없는 형식으로 저장할 때는 background로 바탕을 먼저 채운다.
 */
export function drawScaled(
  img: LoadedImage,
  width: number,
  height: number,
  background?: string,
): HTMLCanvasElement {
  const targetW = Math.max(1, Math.round(width));
  const targetH = Math.max(1, Math.round(height));
  assertCanvasSize(targetW, targetH);

  let curW = img.width;
  let curH = img.height;
  let current: CanvasImageSource = img.source;

  while (curW / 2 > targetW && curH / 2 > targetH) {
    const nextW = Math.max(targetW, Math.floor(curW / 2));
    const nextH = Math.max(targetH, Math.floor(curH / 2));
    const step = createCanvas(nextW, nextH);
    const sctx = get2d(step);
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(current, 0, 0, nextW, nextH);
    current = step;
    curW = nextW;
    curH = nextH;
  }

  const out = createCanvas(targetW, targetH);
  const ctx = get2d(out);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, targetW, targetH);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(current, 0, 0, targetW, targetH);
  return out;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: OutputMime,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new ImageToolError("encode-failed"));
          return;
        }
        // 브라우저가 해당 형식을 지원하지 않으면 PNG로 돌려주므로 이를 오류로 처리한다.
        if (blob.type !== mime) {
          reject(new ImageToolError("format-unsupported"));
          return;
        }
        resolve(blob);
      },
      mime,
      quality,
    );
  });
}

export type TargetEncodeResult = {
  blob: Blob;
  quality: number;
  /** 목표 용량을 맞추지 못하고 최저 품질에서 멈춘 경우 true */
  missedTarget: boolean;
};

/** 목표 용량(바이트) 이하 중 가장 높은 품질을 이분 탐색으로 찾는다. (JPEG/WebP 전용) */
export async function encodeToTargetSize(
  canvas: HTMLCanvasElement,
  mime: "image/jpeg" | "image/webp",
  targetBytes: number,
  minQuality = 0.05,
  maxQuality = 0.95,
): Promise<TargetEncodeResult> {
  const best = await canvasToBlob(canvas, mime, maxQuality);
  if (best.size <= targetBytes) {
    return { blob: best, quality: maxQuality, missedTarget: false };
  }
  const worst = await canvasToBlob(canvas, mime, minQuality);
  if (worst.size > targetBytes) {
    return { blob: worst, quality: minQuality, missedTarget: true };
  }
  let lo = minQuality;
  let hi = maxQuality;
  let bestFit = worst;
  let bestQ = minQuality;
  for (let i = 0; i < 7; i++) {
    const mid = (lo + hi) / 2;
    const blob = await canvasToBlob(canvas, mime, mid);
    if (blob.size <= targetBytes) {
      bestFit = blob;
      bestQ = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { blob: bestFit, quality: bestQ, missedTarget: false };
}

// ---------------------------------------------------------------------------
// EXIF 유지 (JPEG 전용)
// ---------------------------------------------------------------------------

const BINARY_CHUNK_SIZE = 0x8000;

function bytesToBinaryString(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i += BINARY_CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + BINARY_CHUNK_SIZE);
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return result;
}

function binaryStringToBytes(binary: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export type ExifCarryOptions = {
  /** true면 EXIF는 유지하되 GPS(위치) 블록은 비운다. */
  stripGps: boolean;
  width: number;
  height: number;
};

/**
 * 원본 JPEG의 EXIF를 새로 만든 JPEG에 옮겨 넣는다.
 * - Orientation은 1로 되돌린다 (픽셀이 이미 보이는 방향으로 회전되어 있으므로).
 * - 내장 썸네일은 제거한다 (크기가 크고 옛 이미지가 남을 수 있음).
 * - 픽셀 크기 태그는 새 크기로 갱신한다.
 * 원본에 EXIF가 없거나 읽을 수 없으면 새 JPEG를 그대로 돌려준다.
 */
export async function carryJpegExif(
  originalBytes: Uint8Array,
  newJpeg: Blob,
  opts: ExifCarryOptions,
): Promise<Blob> {
  const { default: piexif } = await import("piexifjs");
  const originalBinary = bytesToBinaryString(originalBytes);

  let exifObj: Record<string, Record<string, unknown>>;
  try {
    exifObj = piexif.load(originalBinary);
  } catch {
    return newJpeg;
  }

  const zeroth = (exifObj["0th"] ??= {});
  const exifIfd = (exifObj["Exif"] ??= {});
  // 274 = Orientation, 256/257 = ImageWidth/Length, 40962/40963 = PixelX/YDimension
  zeroth["274"] = 1;
  zeroth["256"] = opts.width;
  zeroth["257"] = opts.height;
  exifIfd["40962"] = opts.width;
  exifIfd["40963"] = opts.height;
  exifObj["1st"] = {};
  (exifObj as Record<string, unknown>).thumbnail = null;
  if (opts.stripGps) exifObj["GPS"] = {};

  try {
    const exifBytes = piexif.dump(exifObj);
    const newBinary = bytesToBinaryString(new Uint8Array(await newJpeg.arrayBuffer()));
    const merged = piexif.insert(exifBytes, newBinary);
    return new Blob([binaryStringToBytes(merged)], { type: "image/jpeg" });
  } catch {
    return newJpeg;
  }
}

// ---------------------------------------------------------------------------
// 표시용 포맷터
// ---------------------------------------------------------------------------

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 100 * 1024 ? 1 : 0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

/** 줄어든 비율(%) — 커졌으면 음수. */
export function savedPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round(((before - after) / before) * 100);
}
