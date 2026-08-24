import {
  computeCropRect,
  type AspectRatioOption,
  type FrameMetadata,
} from "@/lib/frame-canvas";

/**
 * Theme rendering strategy module.
 *
 * Each theme is a data-only preset (ThemeDefinition) plus a `layoutStyle`
 * that picks which drawing strategy renders it. Adding a new theme in the
 * same family (e.g. another bottom-bar color scheme) only needs a new
 * preset entry; a genuinely new look adds one more `draw*Layout` function
 * and a `LayoutStyle` case.
 *
 * Phase 1 ships 6 themes covering the distinct layout families (bottom
 * bar, overlay-on-photo, uniform border, polaroid-style thick margin, and
 * the two-column "shot on" wordmark style). The remaining presets from the
 * original 15-theme request (Leica, Hasselblad, Film Strip, Blurred
 * Background, Vintage Amber, Grid Spec Sheet, Dark Gradient, Custom) are
 * planned for a follow-up phase — see CHANGELOG.md.
 *
 * Camera brand names are shown as plain text (e.g. "Shot on Canon EOS
 * R5m2"), never as brand logo marks — real camera-brand logos (Leica,
 * Canon, Apple, ...) are trademarked assets and this is a public,
 * ad-monetized site, so no logo image files are bundled or drawn.
 */

export type LayoutStyle =
  | "bottom-bar"
  | "polaroid"
  | "shot-on-brand"
  | "overlay"
  | "square-border";

export type ThemeFont = "sans" | "serif" | "mono";

export type ThemeId =
  | "classic-dark"
  | "classic-light"
  | "polaroid"
  | "shot-on-brand"
  | "minimal-overlay"
  | "full-border-square";

export type ThemeDefinition = {
  id: ThemeId;
  /** Translation key suffix under Frame.themes.<id> — themes are named in the UI, not hardcoded here. */
  backgroundColor: string;
  textColor: string;
  subtextColor: string;
  fontFamily: ThemeFont;
  layoutStyle: LayoutStyle;
  /** Default padding (% of cropped photo width) applied when this theme is selected; still user-adjustable via the padding slider. */
  paddingPercent: number;
};

export const THEME_PRESETS: ThemeDefinition[] = [
  {
    id: "classic-dark",
    backgroundColor: "#0a0a0a",
    textColor: "#fafafa",
    subtextColor: "#a3a3a3",
    fontFamily: "sans",
    layoutStyle: "bottom-bar",
    paddingPercent: 4,
  },
  {
    id: "classic-light",
    backgroundColor: "#fafafa",
    textColor: "#171717",
    subtextColor: "#525252",
    fontFamily: "sans",
    layoutStyle: "bottom-bar",
    paddingPercent: 4,
  },
  {
    id: "polaroid",
    backgroundColor: "#fdfdfb",
    textColor: "#262626",
    subtextColor: "#737373",
    fontFamily: "serif",
    layoutStyle: "polaroid",
    paddingPercent: 3,
  },
  {
    id: "shot-on-brand",
    backgroundColor: "#050505",
    textColor: "#fafafa",
    subtextColor: "#d4d4d4",
    fontFamily: "sans",
    layoutStyle: "shot-on-brand",
    paddingPercent: 3,
  },
  {
    id: "minimal-overlay",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    subtextColor: "#e5e5e5",
    fontFamily: "sans",
    layoutStyle: "overlay",
    paddingPercent: 0,
  },
  {
    id: "full-border-square",
    backgroundColor: "#ffffff",
    textColor: "#171717",
    subtextColor: "#525252",
    fontFamily: "sans",
    layoutStyle: "square-border",
    paddingPercent: 5,
  },
];

export function getThemeById(id: ThemeId): ThemeDefinition {
  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0];
}

const FONT_STACKS: Record<ThemeFont, string> = {
  sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  serif: "ui-serif, Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

export type ThemeRenderOptions = {
  themeId: ThemeId;
  aspect: AspectRatioOption;
  /** Padding around the photo, as a percentage of the cropped photo's width (0-10). */
  paddingPercent: number;
  metadata: FrameMetadata;
};

function specLine(metadata: FrameMetadata): string {
  return [
    metadata.focalLength,
    metadata.aperture,
    metadata.shutter,
    metadata.iso ? `ISO${metadata.iso}` : "",
  ]
    .filter(Boolean)
    .join("   ·   ");
}

/**
 * Draws the themed, framed photo onto a canvas at the source image's full
 * resolution (scaled by the crop, never downscaled) — so "Download Framed
 * Photo" exports the same pixel data the preview is built from.
 */
export function renderThemedFrame(
  image: HTMLImageElement,
  options: ThemeRenderOptions,
  targetCanvas?: HTMLCanvasElement,
): HTMLCanvasElement {
  const theme = getThemeById(options.themeId);
  const crop = computeCropRect(
    image.naturalWidth,
    image.naturalHeight,
    options.aspect,
  );
  const canvas = targetCanvas ?? document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const fontFamily = FONT_STACKS[theme.fontFamily];
  const params = { image, crop, theme, options, fontFamily };

  switch (theme.layoutStyle) {
    case "bottom-bar":
      drawBottomBarLayout(ctx, canvas, params);
      break;
    case "polaroid":
      drawPolaroidLayout(ctx, canvas, params);
      break;
    case "shot-on-brand":
      drawShotOnBrandLayout(ctx, canvas, params);
      break;
    case "overlay":
      drawOverlayLayout(ctx, canvas, params);
      break;
    case "square-border":
      drawSquareBorderLayout(ctx, canvas, params);
      break;
  }

  return canvas;
}

type DrawParams = {
  image: HTMLImageElement;
  crop: { sx: number; sy: number; sw: number; sh: number };
  theme: ThemeDefinition;
  options: ThemeRenderOptions;
  fontFamily: string;
};

/** Classic layout: photo on top, solid-color info bar below (two lines: title, specs+date). */
function drawBottomBarLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw);
  const barHeight = Math.round(sw * 0.11);
  const paddingX = Math.round(sw * 0.035);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + barHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  const titleSize = Math.max(14, Math.round(barHeight * 0.28));
  const subtitleSize = Math.max(11, Math.round(barHeight * 0.19));
  const barY = padding * 2 + sh;
  const titleY = barY + barHeight * 0.4;
  const subtitleY = barY + barHeight * 0.72;

  ctx.textBaseline = "middle";
  ctx.fillStyle = theme.textColor;
  ctx.font = `600 ${titleSize}px ${fontFamily}`;
  ctx.textAlign = "left";
  const title = [metadata.camera, metadata.lens].filter(Boolean).join("  —  ");
  ctx.fillText(title, paddingX, titleY, canvas.width - paddingX * 2);

  ctx.fillStyle = theme.subtextColor;
  ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.fillText(specLine(metadata), paddingX, subtitleY, canvas.width * 0.7);

  if (metadata.takenAt) {
    ctx.textAlign = "right";
    ctx.fillText(metadata.takenAt, canvas.width - paddingX, subtitleY, canvas.width * 0.3);
  }
}

/** Polaroid: thin top/side margin, extra-thick bottom margin, centered serif caption. */
function drawPolaroidLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const sidePadding = Math.round((options.paddingPercent / 100) * sw) + Math.round(sw * 0.02);
  const bottomPadding = Math.round(sw * 0.16);

  canvas.width = sw + sidePadding * 2;
  canvas.height = sh + sidePadding + bottomPadding;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, sidePadding, sidePadding, sw, sh);

  const { metadata } = options;
  const captionAreaY = sh + sidePadding;
  const titleSize = Math.max(15, Math.round(bottomPadding * 0.22));
  const subtitleSize = Math.max(11, Math.round(bottomPadding * 0.15));

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = theme.textColor;
  ctx.font = `italic 500 ${titleSize}px ${fontFamily}`;
  const title = [metadata.camera, metadata.lens].filter(Boolean).join(" · ");
  ctx.fillText(title, canvas.width / 2, captionAreaY + bottomPadding * 0.42, canvas.width - sidePadding * 2);

  ctx.fillStyle = theme.subtextColor;
  ctx.font = `${subtitleSize}px ${fontFamily}`;
  const sub = [specLine(metadata), metadata.takenAt].filter(Boolean).join("   ·   ");
  ctx.fillText(sub, canvas.width / 2, captionAreaY + bottomPadding * 0.7, canvas.width - sidePadding * 2);
}

/** Shot-on-brand: bottom bar split left ("Shot on <camera>") / right (specs). */
function drawShotOnBrandLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw);
  const barHeight = Math.round(sw * 0.09);
  const paddingX = Math.round(sw * 0.035);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + barHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  const barY = padding * 2 + sh;
  const centerY = barY + barHeight / 2;
  const baseFontSize = Math.max(13, Math.round(barHeight * 0.26));
  const minFontSize = Math.max(10, Math.round(baseFontSize * 0.6));
  const availableWidth = canvas.width - paddingX * 2;
  const gap = Math.round(sw * 0.03);

  const shotOn = metadata.camera ? `Shot on ${metadata.camera}` : "";
  const specs = specLine(metadata);

  // The left ("Shot on <camera>") and right (specs) strings are variable
  // length — a long camera name can otherwise overlap the specs. Shrink
  // both together, in lockstep, until they fit side by side with a gap.
  let fontSize = baseFontSize;
  let shotOnWidth = 0;
  let specsWidth = 0;
  while (fontSize >= minFontSize) {
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    shotOnWidth = ctx.measureText(shotOn).width;
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    specsWidth = ctx.measureText(specs).width;
    if (shotOnWidth + gap + specsWidth <= availableWidth) break;
    fontSize -= 1;
  }
  // Still doesn't fit at the floor size: truncate the left title so the
  // specs on the right (shutter/aperture/ISO — the more useful half) stay
  // fully legible rather than letting the two halves overlap.
  const maxShotOnWidth = availableWidth - gap - specsWidth;
  const shotOnDisplay =
    shotOnWidth > maxShotOnWidth && maxShotOnWidth > 0
      ? truncateToWidth(ctx, shotOn, maxShotOnWidth, `700 ${fontSize}px ${fontFamily}`)
      : shotOn;

  ctx.textBaseline = "middle";
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = "left";
  ctx.fillText(shotOnDisplay, paddingX, centerY);

  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = theme.subtextColor;
  ctx.textAlign = "right";
  ctx.fillText(specs, canvas.width - paddingX, centerY);
}

/** Shortens text with an ellipsis so it fits within maxWidth at the given font. */
function truncateToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string {
  ctx.font = font;
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

/** Overlay: translucent gradient bar drawn directly on the photo's bottom edge — canvas is just the (optionally padded) photo. */
function drawOverlayLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2;

  if (padding > 0) {
    ctx.fillStyle = theme.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  const overlayHeight = Math.round(sh * 0.16);
  const overlayY = padding + sh - overlayHeight;
  const paddingX = Math.round(sw * 0.04);

  const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.65)");
  ctx.fillStyle = gradient;
  ctx.fillRect(padding, overlayY, sw, overlayHeight);

  const titleSize = Math.max(13, Math.round(overlayHeight * 0.3));
  const subtitleSize = Math.max(10, Math.round(overlayHeight * 0.2));

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = theme.textColor;
  ctx.font = `600 ${titleSize}px ${fontFamily}`;
  const title = [metadata.camera, metadata.lens].filter(Boolean).join("  —  ");
  ctx.fillText(title, padding + paddingX, padding + sh - overlayHeight * 0.42, sw - paddingX * 2);

  ctx.fillStyle = theme.subtextColor;
  ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
  ctx.fillText(specLine(metadata), padding + paddingX, padding + sh - overlayHeight * 0.15, sw * 0.7);
}

/** Square border: uniform margin on all four sides (like a mat/frame), thin caption strip appended below. */
function drawSquareBorderLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw);
  const captionHeight = Math.round(sw * 0.07);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + captionHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  const captionY = padding + sh + captionHeight / 2;
  const fontSize = Math.max(11, Math.round(captionHeight * 0.32));

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = theme.subtextColor;
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  const line = [metadata.camera, specLine(metadata), metadata.takenAt]
    .filter(Boolean)
    .join("   ·   ");
  ctx.fillText(line, canvas.width / 2, captionY, canvas.width - padding * 2);
}
