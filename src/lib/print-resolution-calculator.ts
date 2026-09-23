const MM_PER_INCH = 25.4;
const CM_PER_INCH = 2.54;

export type LengthUnit = "in" | "cm";

export type PrintSizePresetCategory = "photo" | "paper";

export type PrintSizePreset = {
  id: string;
  category: PrintSizePresetCategory;
  /** Human-readable label suffix, e.g. "4×6" or "A4" — the UI adds unit/category text. */
  label: string;
  widthIn: number;
  heightIn: number;
};

/**
 * Common photo-print sizes (already in inches, the standard unit for photo
 * lab prints) and ISO paper sizes (converted from their exact mm
 * dimensions), used as selectable presets for the "check a target print
 * size" direction of the calculator.
 */
export const PRINT_SIZE_PRESETS: PrintSizePreset[] = [
  { id: "photo-4x6", category: "photo", label: "4×6 in", widthIn: 4, heightIn: 6 },
  { id: "photo-5x7", category: "photo", label: "5×7 in", widthIn: 5, heightIn: 7 },
  { id: "photo-8x10", category: "photo", label: "8×10 in", widthIn: 8, heightIn: 10 },
  { id: "photo-8x12", category: "photo", label: "8×12 in", widthIn: 8, heightIn: 12 },
  { id: "photo-11x14", category: "photo", label: "11×14 in", widthIn: 11, heightIn: 14 },
  { id: "photo-16x20", category: "photo", label: "16×20 in", widthIn: 16, heightIn: 20 },
  { id: "photo-20x30", category: "photo", label: "20×30 in", widthIn: 20, heightIn: 30 },
  { id: "paper-a4", category: "paper", label: "A4", widthIn: 210 / MM_PER_INCH, heightIn: 297 / MM_PER_INCH },
  { id: "paper-a3", category: "paper", label: "A3", widthIn: 297 / MM_PER_INCH, heightIn: 420 / MM_PER_INCH },
  { id: "paper-a2", category: "paper", label: "A2", widthIn: 420 / MM_PER_INCH, heightIn: 594 / MM_PER_INCH },
  { id: "paper-a1", category: "paper", label: "A1", widthIn: 594 / MM_PER_INCH, heightIn: 841 / MM_PER_INCH },
];

export const DEFAULT_PRINT_SIZE_PRESET_ID = "photo-8x10";
export const CUSTOM_PRINT_SIZE_ID = "custom";

/** Common print/output resolutions: 150 (large format/posters), 200 (canvas), 300 (standard photo-quality), 600 (fine-art/gallery). */
export const DPI_PRESETS = [150, 200, 300, 600];

export const DEFAULT_WIDTH_PX = 6000;
export const DEFAULT_HEIGHT_PX = 4000;
export const DEFAULT_DPI = 300;
export const DEFAULT_CUSTOM_UNIT: LengthUnit = "in";
export const DEFAULT_CUSTOM_WIDTH_IN = 8;
export const DEFAULT_CUSTOM_HEIGHT_IN = 10;

export type MaxPrintSize = {
  widthIn: number;
  heightIn: number;
  widthCm: number;
  heightCm: number;
};

/** Largest print size (both units) that stays at or above the target DPI for the given pixel dimensions. */
export function calculateMaxPrintSize(
  widthPx: number,
  heightPx: number,
  dpi: number,
): MaxPrintSize | null {
  if (
    !Number.isFinite(widthPx) ||
    widthPx <= 0 ||
    !Number.isFinite(heightPx) ||
    heightPx <= 0 ||
    !Number.isFinite(dpi) ||
    dpi <= 0
  ) {
    return null;
  }
  const widthIn = widthPx / dpi;
  const heightIn = heightPx / dpi;
  return {
    widthIn,
    heightIn,
    widthCm: widthIn * CM_PER_INCH,
    heightCm: heightIn * CM_PER_INCH,
  };
}

export type RequiredPixels = {
  widthPx: number;
  heightPx: number;
  megapixels: number;
};

/** Pixel dimensions needed to print at `widthIn`×`heightIn` without falling below the target DPI. */
export function calculateRequiredPixels(
  widthIn: number,
  heightIn: number,
  dpi: number,
): RequiredPixels | null {
  if (
    !Number.isFinite(widthIn) ||
    widthIn <= 0 ||
    !Number.isFinite(heightIn) ||
    heightIn <= 0 ||
    !Number.isFinite(dpi) ||
    dpi <= 0
  ) {
    return null;
  }
  const widthPx = widthIn * dpi;
  const heightPx = heightIn * dpi;
  return { widthPx, heightPx, megapixels: (widthPx * heightPx) / 1_000_000 };
}

export type UpscaleCategory = "sufficient" | "minor" | "moderate" | "major";

export type UpscaleGuidance = {
  /** Linear scale factor needed (1 = already enough, 2 = every side must roughly double). */
  upscaleFactor: number;
  category: UpscaleCategory;
};

/**
 * How much linear upscaling would be needed to reach a required pixel size
 * from the current one, and a rule-of-thumb category for how safe that is:
 * the scale factor is derived from the AREA ratio (megapixels), since
 * that's what an upscaler actually has to reconstruct, then square-rooted
 * back to a linear (per-side) factor for a more intuitive number.
 */
export function calculateUpscaleGuidance(
  currentWidthPx: number,
  currentHeightPx: number,
  requiredWidthPx: number,
  requiredHeightPx: number,
): UpscaleGuidance | null {
  if (
    !Number.isFinite(currentWidthPx) ||
    currentWidthPx <= 0 ||
    !Number.isFinite(currentHeightPx) ||
    currentHeightPx <= 0 ||
    !Number.isFinite(requiredWidthPx) ||
    requiredWidthPx <= 0 ||
    !Number.isFinite(requiredHeightPx) ||
    requiredHeightPx <= 0
  ) {
    return null;
  }

  const currentArea = currentWidthPx * currentHeightPx;
  const requiredArea = requiredWidthPx * requiredHeightPx;
  const areaRatio = requiredArea / currentArea;
  const upscaleFactor = Math.sqrt(Math.max(areaRatio, 0));

  // Thresholds are a rule of thumb, not a hard physical limit: under ~1x
  // needs no upscaling at all; up to ~1.3x per side is usually invisible
  // even with simple resampling; up to ~2x per side is where a dedicated
  // AI upscaler starts meaningfully outperforming simple resampling;
  // beyond ~2x per side, quality loss becomes hard to avoid and
  // re-shooting at higher resolution (or a smaller print) is the safer
  // recommendation.
  const category: UpscaleCategory =
    upscaleFactor <= 1 ? "sufficient" : upscaleFactor <= 1.3 ? "minor" : upscaleFactor <= 2 ? "moderate" : "major";

  return { upscaleFactor, category };
}

export function formatMegapixels(megapixels: number): string {
  if (!Number.isFinite(megapixels) || megapixels < 0) return "—";
  return `${megapixels.toFixed(1)}MP`;
}

export function formatLengthIn(inches: number): string {
  if (!Number.isFinite(inches) || inches < 0) return "—";
  return `${(Math.round(inches * 10) / 10).toFixed(1)}in`;
}

export function formatLengthCm(cm: number): string {
  if (!Number.isFinite(cm) || cm < 0) return "—";
  return `${(Math.round(cm * 10) / 10).toFixed(1)}cm`;
}

export function formatPixels(px: number): string {
  if (!Number.isFinite(px) || px < 0) return "—";
  return `${Math.round(px).toLocaleString()}px`;
}

export function formatUpscaleFactor(factor: number): string {
  if (!Number.isFinite(factor) || factor < 0) return "—";
  return `${factor.toFixed(2)}×`;
}

export function convertToInches(value: number, unit: LengthUnit): number {
  return unit === "cm" ? value / CM_PER_INCH : value;
}
