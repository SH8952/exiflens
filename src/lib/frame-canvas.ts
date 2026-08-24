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
