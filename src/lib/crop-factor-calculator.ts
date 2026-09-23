export type SensorPresetId =
  | "full-frame"
  | "aps-c-canon"
  | "aps-c"
  | "micro-four-thirds"
  | "one-inch"
  | "medium-format"
  | "custom";

export type SensorPreset = {
  id: SensorPresetId;
  label: string;
  /** Physical sensor width/height in millimeters. null for "custom" — values come from user input. */
  widthMm: number | null;
  heightMm: number | null;
};

export const SENSOR_PRESETS: SensorPreset[] = [
  { id: "full-frame", label: "Full Frame (36×24mm)", widthMm: 36, heightMm: 24 },
  { id: "aps-c-canon", label: "APS-C — Canon (22.3×14.9mm)", widthMm: 22.3, heightMm: 14.9 },
  { id: "aps-c", label: "APS-C — Nikon/Sony/Fuji (23.5×15.6mm)", widthMm: 23.5, heightMm: 15.6 },
  { id: "micro-four-thirds", label: "Micro Four Thirds (17.3×13mm)", widthMm: 17.3, heightMm: 13 },
  { id: "one-inch", label: "1-inch (13.2×8.8mm)", widthMm: 13.2, heightMm: 8.8 },
  { id: "medium-format", label: "Medium Format (43.8×32.9mm)", widthMm: 43.8, heightMm: 32.9 },
  { id: "custom", label: "Custom", widthMm: null, heightMm: null },
];

export const DEFAULT_SENSOR_ID: SensorPresetId = "aps-c";
export const DEFAULT_COMPARE_SENSOR_ID: SensorPresetId = "full-frame";
export const DEFAULT_FOCAL_LENGTH_MM = 50;
export const DEFAULT_CUSTOM_WIDTH_MM = 23.5;
export const DEFAULT_CUSTOM_HEIGHT_MM = 15.6;
export const DEFAULT_APERTURE = 2.8;
export const DEFAULT_SUBJECT_DISTANCE_M = 5;

export const FULL_FRAME_WIDTH_MM = 36;
export const FULL_FRAME_HEIGHT_MM = 24;
export const FULL_FRAME_DIAGONAL_MM = Math.sqrt(
  FULL_FRAME_WIDTH_MM * FULL_FRAME_WIDTH_MM + FULL_FRAME_HEIGHT_MM * FULL_FRAME_HEIGHT_MM,
);

/**
 * Circle-of-confusion approximation used only for this tool's precise DoF
 * diagnosis advanced option: sensor diagonal / 1500, the same widely-used
 * convention already documented in dof-calculator.ts (roughly diagonal /
 * 1500-1550). Not an exact per-camera-model value.
 */
const COC_DIAGONAL_DIVISOR = 1500;

export function calculateDiagonalMm(widthMm: number, heightMm: number): number | null {
  if (!Number.isFinite(widthMm) || widthMm <= 0 || !Number.isFinite(heightMm) || heightMm <= 0) {
    return null;
  }
  return Math.sqrt(widthMm * widthMm + heightMm * heightMm);
}

/** Full-frame-relative crop factor, derived from sensor diagonal (matches the standard manufacturer-quoted values). */
export function calculateCropFactor(widthMm: number, heightMm: number): number | null {
  const diagonal = calculateDiagonalMm(widthMm, heightMm);
  if (diagonal === null) return null;
  return FULL_FRAME_DIAGONAL_MM / diagonal;
}

export function calculateCircleOfConfusionMm(widthMm: number, heightMm: number): number | null {
  const diagonal = calculateDiagonalMm(widthMm, heightMm);
  if (diagonal === null) return null;
  return diagonal / COC_DIAGONAL_DIVISOR;
}

export function calculateEquivalentFocalLengthMm(
  actualFocalLengthMm: number,
  cropFactor: number,
): number | null {
  if (
    !Number.isFinite(actualFocalLengthMm) ||
    actualFocalLengthMm <= 0 ||
    !Number.isFinite(cropFactor) ||
    cropFactor <= 0
  ) {
    return null;
  }
  return actualFocalLengthMm * cropFactor;
}

/** Focal length on a target sensor that reproduces the same field of view as `equivalentFocalLength35mm` on full frame. */
export function calculateComparableFocalLengthMm(
  equivalentFocalLength35mm: number,
  targetCropFactor: number,
): number | null {
  if (
    !Number.isFinite(equivalentFocalLength35mm) ||
    equivalentFocalLength35mm <= 0 ||
    !Number.isFinite(targetCropFactor) ||
    targetCropFactor <= 0
  ) {
    return null;
  }
  return equivalentFocalLength35mm / targetCropFactor;
}

export function calculateFovDegrees(dimensionMm: number, focalLengthMm: number): number | null {
  if (
    !Number.isFinite(dimensionMm) ||
    dimensionMm <= 0 ||
    !Number.isFinite(focalLengthMm) ||
    focalLengthMm <= 0
  ) {
    return null;
  }
  return 2 * Math.atan(dimensionMm / (2 * focalLengthMm)) * (180 / Math.PI);
}

/**
 * Depth-of-field-equivalent f-number on a target sensor, for a matched
 * field of view and subject distance. Standard photographic "equivalence":
 * DoF and diffraction for a matched framing are governed by the physical
 * entrance-pupil diameter rather than the f-number itself, so the
 * equivalent f-number scales with the ratio of the two sensors' crop
 * factors (relative to full frame).
 */
export function calculateEquivalentAperture(
  actualAperture: number,
  sourceCropFactor: number,
  targetCropFactor: number,
): number | null {
  if (
    !Number.isFinite(actualAperture) ||
    actualAperture <= 0 ||
    !Number.isFinite(sourceCropFactor) ||
    sourceCropFactor <= 0 ||
    !Number.isFinite(targetCropFactor) ||
    targetCropFactor <= 0
  ) {
    return null;
  }
  return (actualAperture * sourceCropFactor) / targetCropFactor;
}

export function formatCropFactor(cropFactor: number): string {
  return `${cropFactor.toFixed(2)}×`;
}

export function formatFocalLengthMm(mm: number): string {
  return `${mm.toFixed(0)}mm`;
}

export function formatFovDegrees(degrees: number): string {
  return `${degrees.toFixed(1)}°`;
}

export function formatAperture(aperture: number): string {
  return `f/${aperture.toFixed(1)}`;
}
