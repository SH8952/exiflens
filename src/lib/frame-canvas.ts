export type FrameTheme = "dark" | "light";

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

export type FrameOptions = {
  aspect: AspectRatioOption;
  /** Padding around the photo, as a percentage of the cropped photo's width (0-10). */
  paddingPercent: number;
  theme: FrameTheme;
  metadata: FrameMetadata;
};

const THEME_COLORS: Record<FrameTheme, { background: string; text: string; subtext: string }> = {
  dark: { background: "#0a0a0a", text: "#fafafa", subtext: "#a3a3a3" },
  light: { background: "#fafafa", text: "#171717", subtext: "#525252" },
};

/** Center-crop rectangle (in source-image pixel coordinates) for the selected aspect ratio. */
function computeCropRect(
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
 * Draws the framed photo onto a canvas at the source image's full
 * resolution (scaled by the crop, never downscaled) — so "Download Framed
 * Photo" exports the same pixel data the preview is built from, just via
 * canvas.toBlob() at the end, with no separate low/high-res render path.
 */
export function renderFramedPhoto(
  image: HTMLImageElement,
  options: FrameOptions,
  targetCanvas?: HTMLCanvasElement,
): HTMLCanvasElement {
  const { sx, sy, sw, sh } = computeCropRect(
    image.naturalWidth,
    image.naturalHeight,
    options.aspect,
  );

  const padding = Math.round((options.paddingPercent / 100) * sw);
  const colors = THEME_COLORS[options.theme];

  // The info bar height scales with the cropped photo's width so the type
  // stays legible (and proportionally similar) across resolutions.
  const barHeight = Math.round(sw * 0.11);
  const barPaddingX = Math.round(sw * 0.035);

  // Reuse the caller's canvas when given (the visible preview element) so
  // the exact same full-resolution pixel data that's on screen is what
  // "Download Framed Photo" exports — no separate low/high-res render path.
  const canvas = targetCanvas ?? document.createElement("canvas");
  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + barHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  drawInfoBar(ctx, {
    x: 0,
    y: padding * 2 + sh,
    width: canvas.width,
    height: barHeight,
    paddingX: barPaddingX,
    colors,
    metadata: options.metadata,
  });

  return canvas;
}

function drawInfoBar(
  ctx: CanvasRenderingContext2D,
  opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    paddingX: number;
    colors: { text: string; subtext: string };
    metadata: FrameMetadata;
  },
) {
  const { y, width, height, paddingX, colors, metadata } = opts;
  const fontFamily =
    "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

  const titleSize = Math.max(14, Math.round(height * 0.28));
  const subtitleSize = Math.max(11, Math.round(height * 0.19));

  const titleY = y + height * 0.4;
  const subtitleY = y + height * 0.72;

  // Line 1: camera + lens
  ctx.textBaseline = "middle";
  ctx.fillStyle = colors.text;
  ctx.font = `600 ${titleSize}px ${fontFamily}`;
  ctx.textAlign = "left";
  const title = [metadata.camera, metadata.lens].filter(Boolean).join("  —  ");
  ctx.fillText(title, paddingX, titleY, width - paddingX * 2);

  // Line 2 (left): focal length · aperture · shutter · ISO
  ctx.fillStyle = colors.subtext;
  ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
  ctx.textAlign = "left";
  const specs = [
    metadata.focalLength,
    metadata.aperture,
    metadata.shutter,
    metadata.iso ? `ISO${metadata.iso}` : "",
  ]
    .filter(Boolean)
    .join("   ·   ");
  ctx.fillText(specs, paddingX, subtitleY, width * 0.7);

  // Line 2 (right): taken date
  if (metadata.takenAt) {
    ctx.textAlign = "right";
    ctx.fillText(metadata.takenAt, width - paddingX, subtitleY, width * 0.3);
  }
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
