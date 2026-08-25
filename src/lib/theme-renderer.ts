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
 * Phase 1 shipped 6 themes covering the core layout families (bottom bar,
 * overlay-on-photo, uniform border, polaroid-style thick margin, and the
 * two-column "shot on" wordmark style). Phase 2 (this file) adds the
 * remaining 7 presets from the original 15-theme request — Leica,
 * Hasselblad, Film Strip, Blurred Background, Vintage Amber, Grid Spec
 * Sheet, Dark Gradient — plus a fully user-customizable "Custom" theme
 * (background/text color, font, brand-logo toggle; padding is shared with
 * the existing padding slider). See CHANGELOG.md.
 *
 * Brand marks: rather than embedding scraped/official brand SVG files (an
 * uncertain source to source authentically, and a separate legal question
 * from showing a brand name at all), recognized camera brands get a
 * drawn, brand-colored wordmark badge (BRAND_BADGES below) — e.g. a red
 * "Canon" pill, similar in spirit to how the reference tool's own badges
 * read as styled typography rather than scanned logo art. An unrecognized
 * make falls back to plain "Shot on <camera>" text. The Leica theme uses
 * a small red accent square instead of a wordmark, echoing Leica's own
 * minimal red-square mark without reproducing it.
 */

export type LayoutStyle =
  | "bottom-bar"
  | "polaroid"
  | "shot-on-brand"
  | "overlay"
  | "square-border"
  | "leica-accent"
  | "centered-minimal"
  | "film-strip"
  | "blurred-bg"
  | "vintage-amber"
  | "grid-spec"
  | "dark-gradient";

export type ThemeFont = "sans" | "serif" | "mono";

export type ThemeId =
  | "classic-dark"
  | "classic-light"
  | "polaroid"
  | "shot-on-brand"
  | "minimal-overlay"
  | "full-border-square"
  | "leica"
  | "hasselblad"
  | "film-strip"
  | "blurred-background"
  | "vintage-amber"
  | "grid-spec"
  | "dark-gradient"
  | "custom";

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
  /** Whether brand-badge/accent rendering is shown (shot-on-brand, leica-accent). Defaults to true when omitted. */
  showBrandBadge?: boolean;
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
  {
    id: "leica",
    backgroundColor: "#ffffff",
    textColor: "#111111",
    subtextColor: "#6b6b6b",
    fontFamily: "sans",
    layoutStyle: "leica-accent",
    paddingPercent: 4,
  },
  {
    id: "hasselblad",
    backgroundColor: "#f5f4f0",
    textColor: "#181818",
    subtextColor: "#8a8a85",
    fontFamily: "sans",
    layoutStyle: "centered-minimal",
    paddingPercent: 9,
  },
  {
    id: "film-strip",
    backgroundColor: "#0a0a0a",
    textColor: "#f5f5f5",
    subtextColor: "#a3a3a3",
    fontFamily: "mono",
    layoutStyle: "film-strip",
    paddingPercent: 2,
  },
  {
    id: "blurred-background",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    subtextColor: "#d4d4d4",
    fontFamily: "sans",
    layoutStyle: "blurred-bg",
    paddingPercent: 6,
  },
  {
    id: "vintage-amber",
    backgroundColor: "#f0ead6",
    textColor: "#3a2f1d",
    subtextColor: "#8a7654",
    fontFamily: "mono",
    layoutStyle: "vintage-amber",
    paddingPercent: 3,
  },
  {
    id: "grid-spec",
    backgroundColor: "#ffffff",
    textColor: "#111111",
    subtextColor: "#8a8a8a",
    fontFamily: "mono",
    layoutStyle: "grid-spec",
    paddingPercent: 4,
  },
  {
    id: "dark-gradient",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    subtextColor: "#d4d4d4",
    fontFamily: "sans",
    layoutStyle: "dark-gradient",
    paddingPercent: 0,
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
  /** Only used when themeId === "custom" — the user-built theme definition. */
  customTheme?: ThemeDefinition;
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

type BrandBadge = { label: string; bg: string; text: string };

const BRAND_BADGES: Record<string, BrandBadge> = {
  canon: { label: "Canon", bg: "#c8102e", text: "#ffffff" },
  sony: { label: "SONY", bg: "#000000", text: "#ffffff" },
  nikon: { label: "Nikon", bg: "#111111", text: "#ffe100" },
  leica: { label: "LEICA", bg: "#e2001a", text: "#ffffff" },
  fujifilm: { label: "FUJIFILM", bg: "#00934a", text: "#ffffff" },
  fuji: { label: "FUJIFILM", bg: "#00934a", text: "#ffffff" },
  hasselblad: { label: "HASSELBLAD", bg: "#000000", text: "#ffffff" },
  apple: { label: "Apple", bg: "#000000", text: "#ffffff" },
  panasonic: { label: "Panasonic", bg: "#0b3c8a", text: "#ffffff" },
  olympus: { label: "OM SYSTEM", bg: "#00164d", text: "#ffffff" },
  om: { label: "OM SYSTEM", bg: "#00164d", text: "#ffffff" },
  ricoh: { label: "RICOH", bg: "#c8102e", text: "#ffffff" },
  pentax: { label: "PENTAX", bg: "#00296b", text: "#ffffff" },
  dji: { label: "DJI", bg: "#000000", text: "#ffffff" },
};

/** Splits a combined "Make Model" camera string into a recognized brand badge (if any) and the remaining model text. */
function detectBrand(camera: string): { badge: BrandBadge | null; rest: string } {
  const trimmed = camera.trim();
  if (!trimmed) return { badge: null, rest: "" };
  const match = trimmed.match(/^(\S+)\s*(.*)$/);
  if (!match) return { badge: null, rest: trimmed };
  const [, firstWord, remainder] = match;
  const badge = BRAND_BADGES[firstWord.toLowerCase()] ?? null;
  return { badge, rest: badge ? remainder.trim() : trimmed };
}

function measureBadgeWidth(
  ctx: CanvasRenderingContext2D,
  label: string,
  fontSize: number,
  fontFamily: string,
  paddingX: number,
): number {
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  return ctx.measureText(label).width + paddingX * 2;
}

/** Draws a rounded, brand-colored wordmark badge; returns its width so callers can position what follows. */
function drawBrandBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  height: number,
  badge: BrandBadge,
  fontSize: number,
  fontFamily: string,
): number {
  const paddingX = fontSize * 0.55;
  const width = measureBadgeWidth(ctx, badge.label, fontSize, fontFamily, paddingX);
  const radius = height / 2;

  ctx.fillStyle = badge.bg;
  ctx.beginPath();
  ctx.roundRect(x, centerY - height / 2, width, height, radius);
  ctx.fill();

  ctx.fillStyle = badge.text;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(badge.label, x + paddingX, centerY);

  return width;
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

/** Inserts thin-space tracking between characters for a letter-spaced uppercase caption (no reliance on ctx.letterSpacing, which isn't universally supported). */
function trackedUppercase(text: string): string {
  return text.toUpperCase().split("").join(" ");
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
  const theme =
    options.themeId === "custom"
      ? (options.customTheme ?? getThemeById("classic-dark"))
      : getThemeById(options.themeId);
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
    case "leica-accent":
      drawLeicaAccentLayout(ctx, canvas, params);
      break;
    case "centered-minimal":
      drawCenteredMinimalLayout(ctx, canvas, params);
      break;
    case "film-strip":
      drawFilmStripLayout(ctx, canvas, params);
      break;
    case "blurred-bg":
      drawBlurredBgLayout(ctx, canvas, params);
      break;
    case "vintage-amber":
      drawVintageAmberLayout(ctx, canvas, params);
      break;
    case "grid-spec":
      drawGridSpecLayout(ctx, canvas, params);
      break;
    case "dark-gradient":
      drawDarkGradientLayout(ctx, canvas, params);
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

/**
 * Shot-on-brand: bottom bar split left (brand badge + model, or plain
 * "Shot on <camera>" when the make isn't a recognized brand, or the badge
 * is toggled off) / right (specs).
 */
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
  const showBadge = theme.showBrandBadge !== false;
  const { badge, rest } = showBadge
    ? detectBrand(metadata.camera)
    : { badge: null, rest: metadata.camera };
  const modelText = badge
    ? [rest, metadata.lens].filter(Boolean).join("  —  ")
    : metadata.camera
      ? `Shot on ${metadata.camera}`
      : "";
  const specs = specLine(metadata);

  const barY = padding * 2 + sh;
  const centerY = barY + barHeight / 2;
  const baseFontSize = Math.max(13, Math.round(barHeight * 0.26));
  const minFontSize = Math.max(10, Math.round(baseFontSize * 0.6));
  const availableWidth = canvas.width - paddingX * 2;
  const gap = Math.round(sw * 0.03);
  const badgeGap = Math.round(sw * 0.018);
  const badgeHeight = Math.round(barHeight * 0.46);

  // The badge, the model text, and the specs on the right are all
  // variable-width — a long camera name can otherwise overlap the specs.
  // Shrink font size (and the badge along with it) until everything fits
  // side by side with a gap.
  let fontSize = baseFontSize;
  let badgeWidth = 0;
  let modelWidth = 0;
  let specsWidth = 0;
  while (fontSize >= minFontSize) {
    badgeWidth = badge
      ? measureBadgeWidth(ctx, badge.label, fontSize, fontFamily, fontSize * 0.55)
      : 0;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    modelWidth = ctx.measureText(modelText).width;
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    specsWidth = ctx.measureText(specs).width;
    const leftWidth = (badge ? badgeWidth + badgeGap : 0) + modelWidth;
    if (leftWidth + gap + specsWidth <= availableWidth) break;
    fontSize -= 1;
  }

  // Still doesn't fit at the floor size: truncate the model text so the
  // specs on the right (shutter/aperture/ISO — the more useful half) and
  // the badge stay fully legible rather than letting things overlap.
  const maxModelWidth =
    availableWidth - gap - specsWidth - (badge ? badgeWidth + badgeGap : 0);
  const modelDisplay =
    modelWidth > maxModelWidth && maxModelWidth > 0
      ? truncateToWidth(ctx, modelText, maxModelWidth, `700 ${fontSize}px ${fontFamily}`)
      : modelText;

  ctx.textBaseline = "middle";
  let cursorX = paddingX;
  if (badge) {
    cursorX += drawBrandBadge(ctx, cursorX, centerY, badgeHeight, badge, fontSize, fontFamily);
    cursorX += badgeGap;
  }
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = "left";
  ctx.fillText(modelDisplay, cursorX, centerY);

  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = theme.subtextColor;
  ctx.textAlign = "right";
  ctx.fillText(specs, canvas.width - paddingX, centerY);
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

/** Leica: minimal light bar with a small red accent square (echoing Leica's red-dot mark) beside the camera name. */
function drawLeicaAccentLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw);
  const barHeight = Math.round(sw * 0.1);
  const paddingX = Math.round(sw * 0.035);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + barHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  const barY = padding * 2 + sh;
  const centerY = barY + barHeight / 2;
  const dotSize = Math.round(barHeight * 0.32);
  const showBadge = theme.showBrandBadge !== false;

  let cursorX = paddingX;
  if (showBadge) {
    ctx.fillStyle = "#e2001a";
    ctx.fillRect(cursorX, centerY - dotSize / 2, dotSize, dotSize);
    cursorX += dotSize + Math.round(sw * 0.02);
  }

  const baseTitleSize = Math.max(14, Math.round(barHeight * 0.3));
  const minTitleSize = Math.max(10, Math.round(baseTitleSize * 0.6));
  const subtitleSize = Math.max(11, Math.round(barHeight * 0.19));
  const title = [metadata.camera, metadata.lens].filter(Boolean).join("  ·  ");
  const specs = specLine(metadata);
  const gap = Math.round(sw * 0.03);
  const availableWidth = canvas.width - cursorX - paddingX;

  // Same overlap risk as shot-on-brand: a long camera+lens title can run
  // into the right-aligned specs. Shrink the title font until both sides
  // fit with a gap, then fall back to ellipsis truncation.
  let titleSize = baseTitleSize;
  let titleWidth = 0;
  ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
  const specsWidth = ctx.measureText(specs).width;
  while (titleSize >= minTitleSize) {
    ctx.font = `500 ${titleSize}px ${fontFamily}`;
    titleWidth = ctx.measureText(title).width;
    if (titleWidth + gap + specsWidth <= availableWidth) break;
    titleSize -= 1;
  }
  const maxTitleWidth = availableWidth - gap - specsWidth;
  const titleDisplay =
    titleWidth > maxTitleWidth && maxTitleWidth > 0
      ? truncateToWidth(ctx, title, maxTitleWidth, `500 ${titleSize}px ${fontFamily}`)
      : title;

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = theme.textColor;
  ctx.font = `500 ${titleSize}px ${fontFamily}`;
  ctx.fillText(titleDisplay, cursorX, centerY);

  ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
  ctx.fillStyle = theme.subtextColor;
  ctx.textAlign = "right";
  ctx.fillText(specs, canvas.width - paddingX, centerY);
}

/** Hasselblad-inspired: generous uniform margin, small letter-spaced caption centered below — very little on the page besides the photo. */
function drawCenteredMinimalLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw);
  const captionHeight = Math.round(sw * 0.09);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + captionHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  const captionY = padding + sh + captionHeight / 2;
  const titleSize = Math.max(12, Math.round(captionHeight * 0.26));
  const subtitleSize = Math.max(10, Math.round(captionHeight * 0.16));

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = theme.textColor;
  ctx.font = `500 ${titleSize}px ${fontFamily}`;
  const title = metadata.camera ? trackedUppercase(metadata.camera) : "";
  ctx.fillText(title, canvas.width / 2, captionY - captionHeight * 0.18, canvas.width - padding * 2);

  ctx.fillStyle = theme.subtextColor;
  ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
  const sub = [metadata.lens, specLine(metadata)].filter(Boolean).join("   ·   ");
  ctx.fillText(sub, canvas.width / 2, captionY + captionHeight * 0.22, canvas.width - padding * 2);
}

function drawRoundedHole(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(cx - size / 2, cy - size / 2, size, size, radius);
  ctx.fill();
}

/** Film strip: dark sprocket-hole bars above and below the photo, caption strip beneath. Padding here reads as the side margin only. */
function drawFilmStripLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw);
  const stripHeight = Math.round(sw * 0.05);
  const captionHeight = Math.round(sw * 0.08);

  canvas.width = sw + padding * 2;
  canvas.height = stripHeight * 2 + sh + captionHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Guard against a degenerate (near-zero) gap on very small/narrow crops,
  // which would otherwise turn this into an infinite loop below.
  const holeSize = Math.max(2, Math.round(stripHeight * 0.42));
  const holeGap = Math.max(4, holeSize * 1.6);
  const holeRadius = holeSize * 0.25;
  ctx.fillStyle = "#2b2b2b";
  for (let x = holeGap / 2; x < canvas.width; x += holeGap) {
    drawRoundedHole(ctx, x, stripHeight / 2, holeSize, holeRadius);
    drawRoundedHole(ctx, x, stripHeight + sh + stripHeight / 2, holeSize, holeRadius);
  }

  ctx.drawImage(image, sx, sy, sw, sh, padding, stripHeight, sw, sh);

  const { metadata } = options;
  const captionY = canvas.height - captionHeight / 2;
  const fontSize = Math.max(11, Math.round(captionHeight * 0.3));
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = theme.subtextColor;
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  const line = [metadata.camera, specLine(metadata), metadata.takenAt]
    .filter(Boolean)
    .join("   ·   ");
  ctx.fillText(line, canvas.width / 2, captionY, canvas.width - padding * 2);
}

/** Blurred background: the photo itself, cover-scaled and blurred, fills the frame behind a sharp, padded copy — caption below. */
function drawBlurredBgLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw) + Math.round(sw * 0.03);
  const captionHeight = Math.round(sw * 0.09);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + captionHeight;

  // Blurred, cover-scaled backdrop filling the whole canvas. ctx.filter
  // degrades gracefully (no blur, still a valid image) on the rare
  // browser without Canvas 2D filter support.
  ctx.save();
  ctx.filter = `blur(${Math.max(8, Math.round(sw * 0.02))}px)`;
  const coverScale = Math.max(canvas.width / sw, canvas.height / sh) * 1.08;
  const bw = sw * coverScale;
  const bh = sh * coverScale;
  ctx.drawImage(image, sx, sy, sw, sh, (canvas.width - bw) / 2, (canvas.height - bh) / 2, bw, bh);
  ctx.restore();

  // Dark scrim so the blurred backdrop doesn't fight the sharp photo/text.
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  const captionY = padding + sh + captionHeight / 2;
  const titleSize = Math.max(13, Math.round(captionHeight * 0.3));
  const subtitleSize = Math.max(11, Math.round(captionHeight * 0.2));

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = theme.textColor;
  ctx.font = `600 ${titleSize}px ${fontFamily}`;
  const title = [metadata.camera, metadata.lens].filter(Boolean).join("  —  ");
  ctx.fillText(title, canvas.width / 2, captionY - captionHeight * 0.2, canvas.width - padding * 2);

  ctx.fillStyle = theme.subtextColor;
  ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
  ctx.fillText(specLine(metadata), canvas.width / 2, captionY + captionHeight * 0.24, canvas.width - padding * 2);
}

/** Vintage amber: cream border, soft vignette, and an amber monospace date-stamp in the corner like an old point-and-shoot. */
function drawVintageAmberLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw) + Math.round(sw * 0.015);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const vignette = ctx.createRadialGradient(
    padding + sw / 2,
    padding + sh / 2,
    sh * 0.3,
    padding + sw / 2,
    padding + sh / 2,
    sh * 0.72,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(padding, padding, sw, sh);

  const { metadata } = options;
  const stampSize = Math.max(14, Math.round(sw * 0.024));
  const amber = "#ff8a00";
  const stampX = padding + sw - Math.round(sw * 0.03);
  const stampY = padding + sh - Math.round(sw * 0.03);

  if (metadata.takenAt) {
    ctx.save();
    ctx.shadowColor = "rgba(255,138,0,0.55)";
    ctx.shadowBlur = stampSize * 0.4;
    ctx.fillStyle = amber;
    ctx.font = `600 ${stampSize}px ${fontFamily}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(metadata.takenAt, stampX, stampY);
    ctx.restore();
  }

  if (metadata.camera) {
    const labelSize = Math.max(11, Math.round(sw * 0.016));
    ctx.fillStyle = "#f5ead2";
    ctx.font = `400 ${labelSize}px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(
      [metadata.camera, specLine(metadata)].filter(Boolean).join("   ·   "),
      padding + Math.round(sw * 0.02),
      padding + sh - Math.round(sw * 0.03),
      sw * 0.65,
    );
  }
}

/** Grid spec sheet: photo on top, an even grid of labeled spec cells (CAMERA / LENS / FOCAL / APERTURE / SHUTTER / ISO) below. */
function drawGridSpecLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw);
  const gridHeight = Math.round(sw * 0.15);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + gridHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  // Short spec-sheet-style labels are kept in English regardless of UI
  // locale, matching the existing "ISO" convention used elsewhere in this
  // module — these read as universal gear-spec shorthand, not prose.
  const fields = [
    { label: "CAMERA", value: metadata.camera },
    { label: "LENS", value: metadata.lens },
    { label: "FOCAL", value: metadata.focalLength },
    { label: "APERTURE", value: metadata.aperture },
    { label: "SHUTTER", value: metadata.shutter },
    { label: "ISO", value: metadata.iso ? `ISO${metadata.iso}` : "" },
  ].filter((field) => field.value);

  if (fields.length === 0) return;

  const cellWidth = (canvas.width - padding * 2) / fields.length;
  const gridY = padding * 2 + sh;
  const labelSize = Math.max(9, Math.round(gridHeight * 0.16));
  const valueSize = Math.max(12, Math.round(gridHeight * 0.24));

  ctx.textAlign = "center";
  fields.forEach((field, i) => {
    const cx = padding + cellWidth * (i + 0.5);
    if (i > 0) {
      ctx.strokeStyle = theme.subtextColor;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(padding + cellWidth * i, gridY + gridHeight * 0.2);
      ctx.lineTo(padding + cellWidth * i, gridY + gridHeight * 0.8);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = theme.subtextColor;
    ctx.font = `500 ${labelSize}px ${fontFamily}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(field.label, cx, gridY + gridHeight * 0.42, cellWidth - 8);

    ctx.fillStyle = theme.textColor;
    ctx.font = `700 ${valueSize}px ${fontFamily}`;
    ctx.fillText(field.value, cx, gridY + gridHeight * 0.72, cellWidth - 8);
  });
}

/** Dark gradient overlay: borderless bleed photo, a taller/darker bottom gradient than minimal-overlay, bigger type, subtle date watermark top-right. */
function drawDarkGradientLayout(
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
  const overlayHeight = Math.round(sh * 0.32);
  const overlayY = padding + sh - overlayHeight;

  const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.78)");
  ctx.fillStyle = gradient;
  ctx.fillRect(padding, overlayY, sw, overlayHeight);

  const paddingX = Math.round(sw * 0.045);
  const titleSize = Math.max(16, Math.round(overlayHeight * 0.22));
  const subtitleSize = Math.max(12, Math.round(overlayHeight * 0.14));

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = theme.textColor;
  ctx.font = `700 ${titleSize}px ${fontFamily}`;
  const title = [metadata.camera, metadata.lens].filter(Boolean).join("  —  ");
  ctx.fillText(title, padding + paddingX, padding + sh - overlayHeight * 0.42, sw - paddingX * 2);

  ctx.fillStyle = theme.subtextColor;
  ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
  ctx.fillText(specLine(metadata), padding + paddingX, padding + sh - overlayHeight * 0.2, sw * 0.75);

  if (metadata.takenAt) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
    ctx.textAlign = "right";
    ctx.fillText(
      metadata.takenAt,
      padding + sw - paddingX,
      padding + Math.round(sw * 0.04) + subtitleSize,
      sw * 0.4,
    );
  }
}
