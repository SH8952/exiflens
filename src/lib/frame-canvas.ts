export type AspectRatioOption =
  | "original"
  | "1:1"
  | "4:5"
  | "4:3"
  | "3:2"
  | "16:9"
  | "9:16";

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  "original",
  "1:1",
  "4:5",
  "4:3",
  "3:2",
  "16:9",
  "9:16",
];

/** Editable EXIF fields shown on the frame — overriding these never touches the shared EXIF store. */
export type FrameMetadata = {
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutter: string;
  iso: string;
  takenAt: string;
  /** Free-text fields for the "Tip" theme — unrelated to camera EXIF. */
  tipLabel: string;
  tipHeading: string;
  tipBody1: string;
  tipBody2: string;
  /** Free-text fields for the "Poster" theme — unrelated to camera EXIF. */
  posterDate: string;
  posterTitle1: string;
  posterTitle2: string;
  posterLocationName: string;
  posterLocationAddress: string;
};

/** Center-crop rectangle (in source-image pixel coordinates) for the selected aspect ratio. */
export function computeCropRect(
  imgWidth: number,
  imgHeight: number,
  aspect: AspectRatioOption,
): { sx: number; sy: number; sw: number; sh: number } {
  if (aspect === "original") {
    return { sx: 0, sy: 0, sw: imgWidth, sh: imgHeight };
  }

  const [wRatio, hRatio] = aspect.split(":").map(Number);
  const targetRatio = wRatio / hRatio;
  const sourceRatio = imgWidth / imgHeight;

  if (sourceRatio > targetRatio) {
    // Source is wider than target: crop left/right.
    const sw = imgHeight * targetRatio;
    return { sx: (imgWidth - sw) / 2, sy: 0, sw, sh: imgHeight };
  }
  // Source is taller than target: crop top/bottom.
  const sh = imgWidth / targetRatio;
  return { sx: 0, sy: (imgHeight - sh) / 2, sw: imgWidth, sh };
}

/**
 * Many recent phones (high-res sensor modes especially — 48MP+, sometimes
 * 8000px+ on the long edge) produce photos whose pixel dimensions exceed
 * the canvas size/memory limits some mobile browsers enforce (notably
 * WebKit/iOS, historically capped around 4096×4096 / ~16.7M px total
 * area, and many Android GPUs have similar texture-size ceilings). The
 * frame generator draws the photo onto a canvas at full resolution, so an
 * oversized photo silently produced a blank canvas on those devices —
 * `drawImage`/`toBlob` fail quietly rather than throwing (실제 버그: 모바일에서
 * 사진을 첨부해도 미리보기/다운로드에 사진이 나타나지 않음, 2026-08-31 확인).
 *
 * Desktop browsers handle much larger canvases fine, so instead of always
 * downscaling (which would needlessly reduce download quality for typical
 * photos), this only kicks in once a dimension actually exceeds the safe
 * ceiling below — most phone photos (12–24MP) pass through untouched.
 */
const MAX_IMAGE_DIMENSION = 4000;

function loadPlainImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 디코딩하지 못했습니다"));
    img.src = url;
  });
}

/** Renders a decoded bitmap onto a canvas at `width`×`height`, then returns
 * it as a normal `<img>` (via a fresh object URL) so callers downstream can
 * keep relying on `naturalWidth`/`naturalHeight` unchanged. */
function bitmapToImage(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas 2D 컨텍스트를 사용할 수 없습니다"));
      return;
    }
    ctx.drawImage(source, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("축소된 이미지를 만들지 못했습니다"));
        return;
      }
      const url = URL.createObjectURL(blob);
      loadPlainImage(url)
        .then(resolve, reject)
        .finally(() => URL.revokeObjectURL(url));
    });
  });
}

/**
 * Loads an image from a URL (typically an object URL for the uploaded
 * file), downscaling it if either dimension exceeds `MAX_IMAGE_DIMENSION`
 * so the frame canvas stays within mobile browser size limits. Returns a
 * fresh `HTMLImageElement` either way so callers can keep using
 * `naturalWidth`/`naturalHeight` as before.
 *
 * Prefers `createImageBitmap` over a plain `<img>` decode when available:
 * a first pass (2026-08-31) downscaled *after* a plain `<img>` finished
 * loading, but on some mobile devices the plain decode of a very large
 * photo already fails/produces nothing before that downscale step ever
 * runs — `createImageBitmap` lets the browser decode more efficiently
 * (and, since it hands back real pixel dimensions immediately, we can
 * downscale it in one `drawImage` without ever holding a full-resolution
 * `<img>` in memory). Falls back to the plain-`<img>` path for older
 * browsers without `createImageBitmap`.
 */
export async function loadImageForFrame(url: string): Promise<HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      const blob = await (await fetch(url)).blob();
      const bitmap = await createImageBitmap(blob);
      try {
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);
        return await bitmapToImage(bitmap, width, height);
      } finally {
        bitmap.close();
      }
    } catch {
      // Fall through to the plain-<img> path below — e.g. an older WebView
      // that exposes createImageBitmap but rejects on some inputs.
    }
  }

  const original = await loadPlainImage(url);
  const { naturalWidth: w, naturalHeight: h } = original;
  if (w <= MAX_IMAGE_DIMENSION && h <= MAX_IMAGE_DIMENSION) {
    return original;
  }
  const scale = MAX_IMAGE_DIMENSION / Math.max(w, h);
  return bitmapToImage(original, Math.round(w * scale), Math.round(h * scale));
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: "png" | "jpeg",
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed"));
      },
      format === "png" ? "image/png" : "image/jpeg",
      format === "jpeg" ? quality : undefined,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
