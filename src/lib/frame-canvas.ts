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

/**
 * Loads an image from a URL (typically an object URL for the uploaded
 * file), downscaling it first if either dimension exceeds
 * `MAX_IMAGE_DIMENSION` so the frame canvas stays within mobile browser
 * size limits. Returns a fresh `HTMLImageElement` either way so callers
 * can keep using `naturalWidth`/`naturalHeight` as before.
 */
export function loadImageForFrame(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const original = new Image();
    original.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = original;
      if (w <= MAX_IMAGE_DIMENSION && h <= MAX_IMAGE_DIMENSION) {
        resolve(original);
        return;
      }

      const scale = MAX_IMAGE_DIMENSION / Math.max(w, h);
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = Math.round(w * scale);
      scaledCanvas.height = Math.round(h * scale);
      const ctx = scaledCanvas.getContext("2d");
      if (!ctx) {
        // Extremely unlikely, but fall back to the original rather than
        // failing outright — better a possibly-blank canvas than none.
        resolve(original);
        return;
      }
      ctx.drawImage(original, 0, 0, scaledCanvas.width, scaledCanvas.height);

      scaledCanvas.toBlob((blob) => {
        if (!blob) {
          resolve(original);
          return;
        }
        const scaledUrl = URL.createObjectURL(blob);
        const scaled = new Image();
        scaled.onload = () => {
          URL.revokeObjectURL(scaledUrl);
          resolve(scaled);
        };
        scaled.onerror = () => {
          URL.revokeObjectURL(scaledUrl);
          resolve(original);
        };
        scaled.src = scaledUrl;
      });
    };
    original.onerror = reject;
    original.src = url;
  });
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
