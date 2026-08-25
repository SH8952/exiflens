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
 * two-column "shot on" wordmark style). Phase 2 added the remaining 7
 * presets from the original 15-theme request — Leica, Hasselblad, Film
 * Strip, Blurred Background, Vintage Amber, Grid Spec Sheet, Dark
 * Gradient — plus a fully user-customizable "Custom" theme.
 *
 * Phase 3 (this round, in progress) reworks the theme lineup to track
 * exif-frame.yuru.cam more closely per 석한님 요청: "샷 온 브랜드" was
 * redesigned into "Strap" (two-row info band + on-photo date stamp),
 * "풀 보더" was retired in favor of "핫셀블라드" (now defaulting to a
 * tighter 2% margin, since the two only differed by padding), and three
 * new text-free layouts were added — "No frame" (bare crop), "Just frame"
 * (border only), and "Cinema Scope" (2.35:1 letterbox bars). See
 * CHANGELOG.md for the full rollout across rounds.
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
  | "strap"
  | "overlay"
  | "leica-accent"
  | "centered-minimal"
  | "film-strip"
  | "blurred-bg"
  | "vintage-amber"
  | "grid-spec"
  | "dark-gradient"
  | "no-frame"
  | "just-frame"
  | "cinema-scope"
  | "lightroom-mat"
  | "film-lcd"
  | "monitor"
  | "shot-on"
  | "photo-card"
  | "tip-overlay"
  | "poster-overlay";

export type ThemeFont = "sans" | "serif" | "mono";

export type ThemeId =
  | "classic-dark"
  | "classic-light"
  | "polaroid"
  | "strap"
  | "minimal-overlay"
  | "leica"
  | "hasselblad"
  | "film-strip"
  | "blurred-background"
  | "vintage-amber"
  | "grid-spec"
  | "dark-gradient"
  | "no-frame"
  | "just-frame"
  | "cinema-scope"
  | "lightroom"
  | "film"
  | "monitor"
  | "shot-on"
  | "photo-card"
  | "tip"
  | "poster"
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
  /** Whether brand-badge/accent rendering is shown (strap, leica-accent). Defaults to true when omitted. */
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
    id: "strap",
    backgroundColor: "#ffffff",
    textColor: "#111111",
    subtextColor: "#6b6b6b",
    fontFamily: "sans",
    layoutStyle: "strap",
    // 참고 스크린샷처럼 사진이 정보 바에 바로 맞닿도록 기본 여백 0% (석한님 요청 —
    // 슬라이더로는 여전히 조절 가능).
    paddingPercent: 0,
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
    // Was 9%; 석한 요청으로 기존 "풀 보더" 테마를 흡수하며 2%로 축소
    // (두 테마가 여백 값 말고는 사실상 같은 레이아웃이었음).
    paddingPercent: 2,
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
  {
    id: "no-frame",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    subtextColor: "#ffffff",
    fontFamily: "sans",
    layoutStyle: "no-frame",
    paddingPercent: 0,
  },
  {
    id: "just-frame",
    backgroundColor: "#ffffff",
    textColor: "#171717",
    subtextColor: "#525252",
    fontFamily: "sans",
    layoutStyle: "just-frame",
    paddingPercent: 5,
  },
  {
    id: "cinema-scope",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    subtextColor: "#ffffff",
    fontFamily: "sans",
    layoutStyle: "cinema-scope",
    paddingPercent: 0,
  },
  {
    id: "lightroom",
    backgroundColor: "#1a1a1a",
    textColor: "#e5e5e5",
    subtextColor: "#c9c9c9",
    fontFamily: "sans",
    layoutStyle: "lightroom-mat",
    // 참고 이미지처럼 두꺼운 매트가 아닌 얇은 균일 테두리 (석한님 요청).
    paddingPercent: 2,
  },
  {
    id: "film",
    backgroundColor: "#000000",
    textColor: "#ff8a00",
    subtextColor: "#ff8a00",
    fontFamily: "mono",
    layoutStyle: "film-lcd",
    paddingPercent: 0,
  },
  {
    id: "monitor",
    backgroundColor: "#000000",
    textColor: "#e5e5e5",
    subtextColor: "#7a7a7a",
    fontFamily: "mono",
    layoutStyle: "monitor",
    paddingPercent: 0,
  },
  {
    id: "shot-on",
    backgroundColor: "#ffffff",
    textColor: "#111111",
    subtextColor: "#8a8a8a",
    fontFamily: "sans",
    layoutStyle: "shot-on",
    paddingPercent: 0,
  },
  {
    id: "photo-card",
    backgroundColor: "#ffffff",
    textColor: "#171717",
    subtextColor: "#171717",
    fontFamily: "sans",
    layoutStyle: "photo-card",
    paddingPercent: 0,
  },
  {
    id: "tip",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    subtextColor: "#ffffff",
    fontFamily: "sans",
    layoutStyle: "tip-overlay",
    paddingPercent: 0,
  },
  {
    id: "poster",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    subtextColor: "#ffffff",
    fontFamily: "sans",
    layoutStyle: "poster-overlay",
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
  /**
   * The resolved, user-editable theme definition currently in effect —
   * every preset's colors/font/padding/logo-visibility can be tweaked from
   * its defaults (석한's "모든 테마 커스터마이징" request), not just when
   * themeId === "custom". The caller keeps this in sync with themeId
   * (reset to that preset's defaults on switch); falls back to the raw
   * preset lookup if omitted.
   */
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

/** Dedicated italic-serif stack for brand wordmarks — evokes a logotype feel (script-like, not a plain system sans) without tracing any brand's actual proprietary typeface. Combined with each brand's own signature color (BRAND_BADGES.bg), per 석한's explicit direction. */
const WORDMARK_FONT_STACK = "Georgia, 'Times New Roman', ui-serif, serif";

function measureWordmarkWidth(
  ctx: CanvasRenderingContext2D,
  label: string,
  fontSize: number,
): number {
  ctx.font = `italic 700 ${fontSize}px ${WORDMARK_FONT_STACK}`;
  return ctx.measureText(label).width;
}

/** Draws a brand-colored italic-serif wordmark as plain text — no pill/capsule background, echoing a logotype rather than a colored badge (석한 피드백: "브랜드 둥근 캡슐모양 말고, 폰트도 똑같이"). Returns its width so callers can position what follows. `align` controls whether `x` is the left or right edge of the text. */
function drawBrandWordmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  badge: BrandBadge,
  fontSize: number,
  align: "left" | "right" = "left",
): number {
  ctx.font = `italic 700 ${fontSize}px ${WORDMARK_FONT_STACK}`;
  const width = ctx.measureText(badge.label).width;
  ctx.fillStyle = badge.bg;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(badge.label, x, centerY);
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
  const theme = options.customTheme ?? getThemeById(options.themeId);
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
    case "strap":
      drawStrapLayout(ctx, canvas, params);
      break;
    case "overlay":
      drawOverlayLayout(ctx, canvas, params);
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
    case "no-frame":
      drawNoFrameLayout(ctx, canvas, params);
      break;
    case "just-frame":
      drawJustFrameLayout(ctx, canvas, params);
      break;
    case "cinema-scope":
      drawCinemaScopeLayout(ctx, canvas, params);
      break;
    case "lightroom-mat":
      drawLightroomMatLayout(ctx, canvas, params);
      break;
    case "film-lcd":
      drawFilmLcdLayout(ctx, canvas, params);
      break;
    case "monitor":
      drawMonitorLayout(ctx, canvas, params);
      break;
    case "shot-on":
      drawShotOnLayout(ctx, canvas, params);
      break;
    case "photo-card":
      drawPhotoCardLayout(ctx, canvas, params);
      break;
    case "tip-overlay":
      drawTipOverlayLayout(ctx, canvas, params);
      break;
    case "poster-overlay":
      drawPosterOverlayLayout(ctx, canvas, params);
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
 * Strap: a plain white info bar beneath the photo — date on the left;
 * on the right, a brand wordmark (italic serif, brand-signature color, no
 * capsule background), a thin vertical divider, then a two-line stacked
 * block (camera model bold on top, lens regular below), all right-aligned.
 * No exposure spec line — this theme is deliberately just date + gear ID,
 * matching a specific reference screenshot 석한님 provided (사진 자체는 이미
 * Lightroom 워터마크가 포함된 원본이라 프레임에서 별도 워터마크는 추가하지 않음).
 * Photo sits flush against the bar by default (0% padding) — the padding
 * slider still adds a uniform margin around everything if the user wants one.
 */
function drawStrapLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options }: DrawParams,
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
  const modelText = rest || metadata.camera;
  const lens = metadata.lens;
  const date = metadata.takenAt;

  const barY = padding * 2 + sh;
  const centerY = barY + barHeight / 2;
  const rightEdge = canvas.width - paddingX;
  const availableWidth = canvas.width - paddingX * 2;

  // Base sizes for every text element in the bar. All of them shrink
  // together (same scale factor) if the bar gets too crowded, rather than
  // any one of them (camera model, lens — equipment-identifying text) ever
  // being ellipsis-truncated, per 석한's standing "shrink, never truncate"
  // rule for gear names.
  const baseDateSize = Math.max(10, Math.round(barHeight * 0.26));
  const baseModelSize = Math.max(12, Math.round(barHeight * 0.24));
  const baseLensSize = Math.max(9, Math.round(barHeight * 0.16));
  const baseWordmarkSize = Math.max(13, Math.round(barHeight * 0.28));
  const dividerGap = Math.round(sw * 0.012);
  const badgeGap = Math.round(sw * 0.012);
  const midGap = Math.round(sw * 0.025);

  let scale = 1;
  let dateWidth = 0;
  let modelWidth = 0;
  let lensWidth = 0;
  let badgeWidth = 0;
  for (; scale > 0.05; scale -= 0.02) {
    ctx.font = `400 ${Math.max(1, Math.round(baseDateSize * scale))}px ${WORDMARK_FONT_STACK}`;
    dateWidth = date ? ctx.measureText(date).width : 0;
    ctx.font = `700 ${Math.max(1, Math.round(baseModelSize * scale))}px ${WORDMARK_FONT_STACK}`;
    modelWidth = ctx.measureText(modelText).width;
    ctx.font = `400 ${Math.max(1, Math.round(baseLensSize * scale))}px ${WORDMARK_FONT_STACK}`;
    lensWidth = lens ? ctx.measureText(lens).width : 0;
    badgeWidth = badge
      ? measureWordmarkWidth(ctx, badge.label, Math.max(1, Math.round(baseWordmarkSize * scale)))
      : 0;

    const blockWidth = Math.max(modelWidth, lensWidth);
    const rightWidth = (badge ? badgeWidth + badgeGap + dividerGap : 0) + blockWidth;
    if (dateWidth + midGap + rightWidth <= availableWidth) break;
  }

  const dateSize = Math.max(1, Math.round(baseDateSize * scale));
  const modelSize = Math.max(1, Math.round(baseModelSize * scale));
  const lensSize = Math.max(1, Math.round(baseLensSize * scale));
  const wordmarkSize = Math.max(1, Math.round(baseWordmarkSize * scale));
  const blockWidth = Math.max(modelWidth, lensWidth);

  // Left: date.
  if (date) {
    ctx.font = `400 ${dateSize}px ${WORDMARK_FONT_STACK}`;
    ctx.fillStyle = theme.subtextColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(date, paddingX, centerY);
  }

  // Right: two-line block (model / lens), right-aligned to the bar's edge.
  const lineGap = Math.round(barHeight * 0.06);
  const modelY = centerY - modelSize * 0.4 - lineGap / 2;
  const lensY = centerY + lensSize * 0.55 + lineGap / 2;

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${modelSize}px ${WORDMARK_FONT_STACK}`;
  ctx.fillStyle = theme.textColor;
  ctx.fillText(modelText, rightEdge, modelY);

  if (lens) {
    ctx.font = `400 ${lensSize}px ${WORDMARK_FONT_STACK}`;
    ctx.fillStyle = theme.subtextColor;
    ctx.fillText(lens, rightEdge, lensY);
  }

  // Divider + brand wordmark, positioned to the left of the text block.
  if (badge) {
    const dividerX = rightEdge - blockWidth - dividerGap;
    ctx.strokeStyle = theme.subtextColor;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = Math.max(1, Math.round(sw * 0.0015));
    ctx.beginPath();
    ctx.moveTo(dividerX, barY + barHeight * 0.24);
    ctx.lineTo(dividerX, barY + barHeight * 0.76);
    ctx.stroke();
    ctx.globalAlpha = 1;

    drawBrandWordmark(ctx, dividerX - badgeGap, centerY, badge, wordmarkSize, "right");
  }
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

  // Same overlap risk as strap: a long camera+lens title can run
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
  const gridHeight = Math.round(sw * 0.17);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + gridHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  // Short spec-sheet-style labels are kept in English regardless of UI
  // locale, matching the existing "ISO" convention used elsewhere in this
  // module — these read as universal gear-spec shorthand, not prose.
  // Camera/lens values ("Canon EOS R5m2", "RF24-70mm F2.8 L IS USM") run
  // much longer than the numeric specs, so their cells get a bigger share
  // of the row width (weight) instead of splitting evenly.
  const fields = [
    { label: "CAMERA", value: metadata.camera, weight: 1.5 },
    { label: "LENS", value: metadata.lens, weight: 1.5 },
    { label: "FOCAL", value: metadata.focalLength, weight: 0.8 },
    { label: "APERTURE", value: metadata.aperture, weight: 0.9 },
    { label: "SHUTTER", value: metadata.shutter, weight: 0.9 },
    { label: "ISO", value: metadata.iso ? `ISO${metadata.iso}` : "", weight: 0.8 },
  ].filter((field) => field.value);

  if (fields.length === 0) return;

  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
  const availableWidth = canvas.width - padding * 2;
  const gridY = padding * 2 + sh;
  const baseLabelSize = Math.max(10, Math.round(gridHeight * 0.2));
  const baseValueSize = Math.max(14, Math.round(gridHeight * 0.34));
  // Tighter inner cell padding than before — trades some breathing room
  // for bigger label/value text (더 크게 보이도록, 간격은 줄임 — 석한님 요청).
  const cellPadding = Math.max(3, Math.round(sw * 0.006));

  const cellWidths = fields.map((field) => (field.weight / totalWeight) * availableWidth);

  // The whole point of this frame is to record exactly which gear was
  // used, so equipment names are never ellipsis-truncated (per 석한's
  // explicit direction — cutting off the camera/lens name would defeat
  // the purpose). Instead, find the single font size, shared across every
  // cell, that lets the tightest-fitting value fit in full — sized
  // precisely from the measured width so it's an exact fit, not a
  // decrement loop with an early-exit floor.
  let sharedValueSize = baseValueSize;
  let sharedLabelSize = baseLabelSize;
  fields.forEach((field, i) => {
    const maxTextWidth = Math.max(1, cellWidths[i] - cellPadding * 2);

    ctx.font = `700 ${baseValueSize}px ${fontFamily}`;
    const valueWidthAtBase = ctx.measureText(field.value).width;
    if (valueWidthAtBase > maxTextWidth) {
      sharedValueSize = Math.min(
        sharedValueSize,
        Math.max(1, Math.floor(baseValueSize * (maxTextWidth / valueWidthAtBase))),
      );
    }

    ctx.font = `500 ${baseLabelSize}px ${fontFamily}`;
    const labelWidthAtBase = ctx.measureText(field.label).width;
    if (labelWidthAtBase > maxTextWidth) {
      sharedLabelSize = Math.min(
        sharedLabelSize,
        Math.max(1, Math.floor(baseLabelSize * (maxTextWidth / labelWidthAtBase))),
      );
    }
  });

  // Keep label and value visually balanced: if the values had to shrink
  // a lot to fit, shrink the (usually short, rarely-constrained) labels
  // by the same proportion too, rather than leaving oversized labels
  // looming over tiny values.
  const shrinkRatio = sharedValueSize / baseValueSize;
  if (shrinkRatio < 0.85) {
    sharedLabelSize = Math.min(
      sharedLabelSize,
      Math.max(1, Math.round(baseLabelSize * shrinkRatio)),
    );
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let cursorX = padding;
  fields.forEach((field, i) => {
    const cellWidth = cellWidths[i];
    const cx = cursorX + cellWidth / 2;

    if (i > 0) {
      ctx.strokeStyle = theme.subtextColor;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(cursorX, gridY + gridHeight * 0.2);
      ctx.lineTo(cursorX, gridY + gridHeight * 0.8);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = theme.subtextColor;
    ctx.font = `500 ${sharedLabelSize}px ${fontFamily}`;
    ctx.fillText(field.label, cx, gridY + gridHeight * 0.42);

    ctx.fillStyle = theme.textColor;
    ctx.font = `700 ${sharedValueSize}px ${fontFamily}`;
    ctx.fillText(field.value, cx, gridY + gridHeight * 0.72);

    cursorX += cellWidth;
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

/** No frame: the cropped photo exactly as-is — no border, no text, no padding. */
function drawNoFrameLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  canvas.width = sw;
  canvas.height = sh;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
}

/** Just frame: a uniform decorative border only — no caption text at all. */
function drawJustFrameLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw) || Math.round(sw * 0.05);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);
}

/** Cinema scope: letterbox bars over the photo to a ~2.35:1 visible aspect — no text, pure widescreen crop feel. */
function drawCinemaScopeLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options }: DrawParams,
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

  const targetRatio = 2.35;
  const currentRatio = sw / sh;
  if (currentRatio < targetRatio) {
    const visibleHeight = sw / targetRatio;
    const barHeight = Math.max(0, (sh - visibleHeight) / 2);
    if (barHeight > 0) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(padding, padding, sw, barHeight);
      ctx.fillRect(padding, padding + sh - barHeight, sw, barHeight);
    }
  }
}

/**
 * Lightroom: a thin, uniform dark mat around the photo (like Lightroom's
 * own export border) with a quiet caption tucked inside the bottom edge of
 * that mat — camera+lens on the left, date on the right, no exposure
 * specs, plain text with no accents or brand mark. Matches a reference
 * export 석한님 sent exactly: thin ~1.5% border on all sides (not a thick
 * mat), caption sized to fit inside that thin strip rather than adding
 * extra canvas height.
 */
function drawLightroomMatLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw) || Math.round(sw * 0.015);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  const left = [metadata.camera, metadata.lens].filter(Boolean).join("   ");
  const right = metadata.takenAt;
  if (!left && !right) return;

  const captionY = padding + sh + padding / 2;
  const baseSize = Math.max(8, Math.round(padding * 0.32));
  const gap = Math.round(sw * 0.02);
  const maxTotalWidth = canvas.width - padding * 2 - gap;

  // Camera/lens are equipment-identifying text, so shrink (no floor)
  // rather than truncate if the two sides together are too wide for the
  // thin border strip.
  let size = baseSize;
  ctx.font = `400 ${size}px ${fontFamily}`;
  while (
    size > 1 &&
    ctx.measureText(left).width + ctx.measureText(right).width > maxTotalWidth
  ) {
    size -= 1;
    ctx.font = `400 ${size}px ${fontFamily}`;
  }

  ctx.fillStyle = theme.subtextColor;
  ctx.textBaseline = "middle";
  if (left) {
    ctx.textAlign = "left";
    ctx.fillText(left, padding, captionY);
  }
  if (right) {
    ctx.textAlign = "right";
    ctx.fillText(right, canvas.width - padding, captionY);
  }
}

/**
 * Film: an old point-and-shoot "data back" look — no border by default,
 * amber LCD-style stamp burned into the photo's bottom-left corner as 3
 * stacked, uppercase, letter-spaced lines (date / camera / lens — no
 * exposure specs), all one size, with a soft amber glow. Matches a
 * reference export 석한님 sent exactly: same 3-line order, all caps, no
 * f-stop/shutter/ISO line. Distinct from Vintage Amber (cream mat +
 * single-line date stamp bottom-right) and Film Strip (sprocket holes +
 * caption bar below photo).
 */
function drawFilmLcdLayout(
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
  const lines = [metadata.takenAt, metadata.camera, metadata.lens]
    .filter(Boolean)
    .map((s) => s.toUpperCase());
  if (lines.length === 0) return;

  const stampX = padding + Math.round(sw * 0.025);
  const inset = Math.round(sw * 0.03);
  const baseSize = Math.max(13, Math.round(sw * 0.02));
  const lineHeight = baseSize * 1.75;
  const maxWidth = sw - inset * 2;

  // Camera/lens are equipment-identifying text, so shrink (no floor)
  // rather than truncate if any line is wider than the photo.
  let size = baseSize;
  ctx.font = `700 ${size}px ${fontFamily}`;
  while (size > 1 && lines.some((l) => ctx.measureText(l).width > maxWidth)) {
    size -= 1;
    ctx.font = `700 ${size}px ${fontFamily}`;
  }

  ctx.save();
  ctx.shadowColor = "rgba(255,138,0,0.55)";
  ctx.shadowBlur = size * 0.4;
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${size}px ${fontFamily}`;

  const bottomY = padding + sh - inset;
  const startY = bottomY - lineHeight * (lines.length - 1);
  lines.forEach((line, i) => {
    ctx.fillText(line, stampX, startY + lineHeight * i, maxWidth);
  });

  ctx.restore();
}

/**
 * Monitor: full-bleed photo with a thin, solid black band along the bottom
 * only — no border on the other three sides, no text at all. Matches the
 * reference design exactly (confirmed by the user: "모니터 테마는 하단에
 * 검은색 띠만 있는게 정상이야").
 */
function drawMonitorLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  // The padding slider (default 0) adds an optional uniform outer margin on
  // top of the fixed-ratio bottom band, consistent with how other themes
  // let padding grow beyond their built-in accent.
  const margin = Math.round((options.paddingPercent / 100) * sw);
  const bandHeight = Math.round(sw * 0.035);

  canvas.width = sw + margin * 2;
  canvas.height = sh + margin * 2 + bandHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, margin, margin, sw, sh);
}

/**
 * Shot On: full-bleed photo (no border on top/left/right) with a thin
 * white bar under the photo holding one left-aligned line — "Shot on "
 * (light) followed immediately by the camera model + lens in bold. Unlike
 * the retired "샷 온 브랜드" theme, no brand name is separately prefixed —
 * the camera field already carries the brand (e.g. "Canon EOS R5m2"), so
 * repeating it would just duplicate the word (석한 피드백: 참고 사이트에서 보인
 * "Canon Canon ..." 중복은 자연스럽게 제거). Matches a reference export
 * 석한님 sent exactly: ~4.9%-of-width bar height, bold gear name, no lens
 * ellipsis — shrinks (no floor) instead, per the standing gear-name rule.
 */
function drawShotOnLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const padding = Math.round((options.paddingPercent / 100) * sw);
  const barHeight = Math.round(sw * 0.049);

  canvas.width = sw + padding * 2;
  canvas.height = sh + padding * 2 + barHeight;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, padding, padding, sw, sh);

  const { metadata } = options;
  const gear = [metadata.camera, metadata.lens].filter(Boolean).join(" ");
  if (!gear) return;

  const barY = padding * 2 + sh;
  const centerY = barY + barHeight / 2;
  const paddingX = Math.round(sw * 0.018);
  const prefix = "Shot on ";
  const baseSize = Math.max(10, Math.round(barHeight * 0.34));
  const maxWidth = canvas.width - paddingX * 2;

  let size = baseSize;
  let prefixWidth = 0;
  let gearWidth = 0;
  ctx.font = `400 ${size}px ${fontFamily}`;
  prefixWidth = ctx.measureText(prefix).width;
  ctx.font = `700 ${size}px ${fontFamily}`;
  gearWidth = ctx.measureText(gear).width;
  while (size > 1 && prefixWidth + gearWidth > maxWidth) {
    size -= 1;
    ctx.font = `400 ${size}px ${fontFamily}`;
    prefixWidth = ctx.measureText(prefix).width;
    ctx.font = `700 ${size}px ${fontFamily}`;
    gearWidth = ctx.measureText(gear).width;
  }

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = theme.subtextColor;
  ctx.font = `400 ${size}px ${fontFamily}`;
  ctx.fillText(prefix, paddingX, centerY);

  ctx.fillStyle = theme.textColor;
  ctx.font = `700 ${size}px ${fontFamily}`;
  ctx.fillText(gear, paddingX + prefixWidth, centerY);
}

/**
 * Photo Card: a white passe-partout border around the photo — thicker on
 * top (~4.9% of width) than the sides (~1.2%), and a generous blank area
 * below (~11.8%) holding one centered, regular-weight caption line
 * ("shot on {camera}", no lens — deliberately simpler than Shot On).
 * Matches a reference export exactly (measured via pixel row/column
 * brightness scans of 석한님's sample photo).
 */
function drawPhotoCardLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  const extra = Math.round((options.paddingPercent / 100) * sw);
  const topBorder = Math.round(sw * 0.0488) + extra;
  const sideBorder = Math.round(sw * 0.0122) + extra;
  const bottomArea = Math.round(sw * 0.1175) + extra;

  canvas.width = sw + sideBorder * 2;
  canvas.height = topBorder + sh + bottomArea;

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, sideBorder, topBorder, sw, sh);

  const { metadata } = options;
  const text = metadata.camera ? `shot on ${metadata.camera}` : "";
  if (!text) return;

  const captionCenterY = topBorder + sh + bottomArea * 0.42;
  const baseSize = Math.max(10, Math.round(bottomArea * 0.22));
  const maxWidth = canvas.width - sideBorder * 2 - Math.round(sw * 0.04);

  let size = baseSize;
  ctx.font = `400 ${size}px ${fontFamily}`;
  while (size > 1 && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `400 ${size}px ${fontFamily}`;
  }

  ctx.fillStyle = theme.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, captionCenterY);
}

/**
 * Tip: a generic (non-EXIF) text-overlay template — bold uppercase label
 * + heading centered near the top, two smaller body lines centered near
 * the bottom, white text with a soft drop shadow directly on the
 * full-bleed photo (no border, no scrim). Text comes from the dedicated
 * tipLabel/tipHeading/tipBody1/tipBody2 metadata fields rather than camera
 * EXIF (석한 확인: "EXIF 정보와 별개로 자유 입력 필드로 추가"). Every line
 * shrinks (no floor) rather than truncates, matching this app's standing
 * no-truncation rule.
 */
function drawTipOverlayLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  canvas.width = sw;
  canvas.height = sh;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

  const { metadata } = options;
  const label = metadata.tipLabel;
  const heading = metadata.tipHeading;
  const bodyLines = [metadata.tipBody1, metadata.tipBody2].filter(Boolean);
  const maxWidth = sw * 0.86;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = Math.round(sw * 0.006);
  ctx.shadowOffsetY = Math.round(sw * 0.002);
  ctx.textAlign = "center";

  if (label) {
    let size = Math.max(14, Math.round(sw * 0.034));
    const upper = label.toUpperCase();
    ctx.font = `700 ${size}px ${fontFamily}`;
    while (size > 1 && ctx.measureText(upper).width > maxWidth) {
      size -= 1;
      ctx.font = `700 ${size}px ${fontFamily}`;
    }
    ctx.fillStyle = theme.textColor;
    ctx.textBaseline = "top";
    ctx.fillText(upper, sw / 2, sh * 0.062);
  }

  if (heading) {
    let size = Math.max(12, Math.round(sw * 0.026));
    ctx.font = `400 ${size}px ${fontFamily}`;
    while (size > 1 && ctx.measureText(heading).width > maxWidth) {
      size -= 1;
      ctx.font = `400 ${size}px ${fontFamily}`;
    }
    ctx.fillStyle = theme.textColor;
    ctx.textBaseline = "top";
    ctx.fillText(heading, sw / 2, sh * 0.14);
  }

  if (bodyLines.length > 0) {
    let size = Math.max(11, Math.round(sw * 0.018));
    ctx.font = `400 ${size}px ${fontFamily}`;
    bodyLines.forEach((line) => {
      while (size > 1 && ctx.measureText(line).width > maxWidth) {
        size -= 1;
        ctx.font = `400 ${size}px ${fontFamily}`;
      }
    });

    const lineHeight = size * 1.7;
    const bottomCenterY = sh * 0.85;
    const startY = bottomCenterY - (lineHeight * (bodyLines.length - 1)) / 2;
    ctx.fillStyle = theme.subtextColor;
    ctx.textBaseline = "middle";
    bodyLines.forEach((line, i) => {
      ctx.fillText(line, sw / 2, startY + lineHeight * i);
    });
  }

  ctx.restore();
}

/**
 * Poster: a generic (non-EXIF) event/editorial template — top-left date +
 * two-line bold title, bottom-left bold location name + address, white
 * text with a soft drop shadow directly on the full-bleed photo. Text
 * comes from posterDate/posterTitle1/posterTitle2/posterLocationName/
 * posterLocationAddress rather than camera EXIF, same as Tip. Every line
 * shrinks (no floor) rather than truncates.
 */
function drawPosterOverlayLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { image, crop, theme, options, fontFamily }: DrawParams,
) {
  const { sx, sy, sw, sh } = crop;
  canvas.width = sw;
  canvas.height = sh;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

  const { metadata } = options;
  const marginX = Math.round(sw * 0.037);
  const maxWidth = sw - marginX * 2;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = Math.round(sw * 0.006);
  ctx.shadowOffsetY = Math.round(sw * 0.002);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let cursorY = sh * 0.115;
  if (metadata.posterDate) {
    const size = Math.max(11, Math.round(sw * 0.017));
    ctx.font = `400 ${size}px ${fontFamily}`;
    ctx.fillStyle = theme.subtextColor;
    ctx.fillText(metadata.posterDate, marginX, cursorY);
    cursorY += size * 1.9;
  }

  const titleLines = [metadata.posterTitle1, metadata.posterTitle2].filter(Boolean);
  if (titleLines.length > 0) {
    let size = Math.max(20, Math.round(sw * 0.052));
    ctx.font = `700 ${size}px ${fontFamily}`;
    titleLines.forEach((line) => {
      while (size > 1 && ctx.measureText(line).width > maxWidth) {
        size -= 1;
        ctx.font = `700 ${size}px ${fontFamily}`;
      }
    });
    const lineHeight = size * 1.5;
    ctx.fillStyle = theme.textColor;
    titleLines.forEach((line, i) => {
      ctx.fillText(line, marginX, cursorY + lineHeight * i);
    });
  }

  let bottomCursorY = sh * 0.79;
  if (metadata.posterLocationName) {
    let size = Math.max(16, Math.round(sw * 0.033));
    ctx.font = `700 ${size}px ${fontFamily}`;
    while (size > 1 && ctx.measureText(metadata.posterLocationName).width > maxWidth) {
      size -= 1;
      ctx.font = `700 ${size}px ${fontFamily}`;
    }
    ctx.fillStyle = theme.textColor;
    ctx.fillText(metadata.posterLocationName, marginX, bottomCursorY);
    bottomCursorY += size * 1.35;
  }
  if (metadata.posterLocationAddress) {
    let size = Math.max(11, Math.round(sw * 0.016));
    ctx.font = `400 ${size}px ${fontFamily}`;
    while (size > 1 && ctx.measureText(metadata.posterLocationAddress).width > maxWidth) {
      size -= 1;
      ctx.font = `400 ${size}px ${fontFamily}`;
    }
    ctx.fillStyle = theme.subtextColor;
    ctx.fillText(metadata.posterLocationAddress, marginX, bottomCursorY);
  }

  ctx.restore();
}
