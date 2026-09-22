export type SensorPresetId =
  | "full-frame"
  | "aps-c"
  | "micro-four-thirds"
  | "one-inch"
  | "medium-format"
  | "custom";

export type SensorPreset = {
  id: SensorPresetId;
  label: string;
  circleOfConfusionMm: number | null; // null for "custom" — value comes from user input
};

/**
 * Circle of confusion (CoC) values in millimeters. These are the
 * widely-cited default approximations used by most online DoF calculators
 * (roughly sensor diagonal / 1500-1550) — not exact per-camera-model
 * values, since acceptable blur also depends on viewing distance and
 * print/display size.
 */
export const SENSOR_PRESETS: SensorPreset[] = [
  {
    id: "full-frame",
    label: "Full Frame (36×24mm)",
    circleOfConfusionMm: 0.03,
  },
  {
    id: "aps-c",
    label: "APS-C (~23.5×15.6mm)",
    circleOfConfusionMm: 0.02,
  },
  {
    id: "micro-four-thirds",
    label: "Micro Four Thirds (17.3×13mm)",
    circleOfConfusionMm: 0.015,
  },
  {
    id: "one-inch",
    label: "1-inch (13.2×8.8mm)",
    circleOfConfusionMm: 0.011,
  },
  {
    id: "medium-format",
    label: "Medium Format (44×33mm)",
    circleOfConfusionMm: 0.036,
  },
  { id: "custom", label: "Custom", circleOfConfusionMm: null },
];

export const MIN_CUSTOM_COC_MM = 0.001;
export const MAX_CUSTOM_COC_MM = 0.1;

export const APERTURE_PRESETS = [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

export const DEFAULT_FOCAL_LENGTH_MM = 50;
export const DEFAULT_APERTURE = 2.8;
export const DEFAULT_SUBJECT_DISTANCE_M = 5;

export type DofResult = {
  hyperfocalMeters: number;
  nearLimitMeters: number;
  farLimitMeters: number | null; // null = infinity
  totalDofMeters: number | null; // null = infinity
  withinHyperfocal: boolean;
};

/**
 * Classic hyperfocal-distance depth of field formulas:
 *   H = f² / (N·c) + f
 *   Dn = (H·s) / (H + (s - f))
 *   Df = (H·s) / (H - (s - f))   (infinity when s >= H)
 * f, N, c are in millimeters; subject distance is given in meters and
 * converted internally.
 */
export function calculateDof(
  focalLengthMm: number,
  aperture: number,
  circleOfConfusionMm: number,
  subjectDistanceM: number,
): DofResult | null {
  if (
    !Number.isFinite(focalLengthMm) ||
    focalLengthMm <= 0 ||
    !Number.isFinite(aperture) ||
    aperture <= 0 ||
    !Number.isFinite(circleOfConfusionMm) ||
    circleOfConfusionMm <= 0 ||
    !Number.isFinite(subjectDistanceM) ||
    subjectDistanceM <= 0
  ) {
    return null;
  }

  const f = focalLengthMm;
  const N = aperture;
  const c = circleOfConfusionMm;
  const s = subjectDistanceM * 1000; // meters -> mm

  const hyperfocalMm = (f * f) / (N * c) + f;
  const hyperfocalMeters = hyperfocalMm / 1000;
  const withinHyperfocal = s < hyperfocalMm;

  const nearLimitMm = (hyperfocalMm * s) / (hyperfocalMm + (s - f));
  const nearLimitMeters = Math.max(0, nearLimitMm / 1000);

  if (!withinHyperfocal) {
    return {
      hyperfocalMeters,
      nearLimitMeters,
      farLimitMeters: null,
      totalDofMeters: null,
      withinHyperfocal,
    };
  }

  const farLimitMm = (hyperfocalMm * s) / (hyperfocalMm - (s - f));
  const farLimitMeters = farLimitMm / 1000;

  return {
    hyperfocalMeters,
    nearLimitMeters,
    farLimitMeters,
    totalDofMeters: farLimitMeters - nearLimitMeters,
    withinHyperfocal,
  };
}

export function formatDistanceMeters(meters: number): string {
  if (!Number.isFinite(meters)) return "—";
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)}km`;
  if (meters >= 10) return `${meters.toFixed(1)}m`;
  return `${meters.toFixed(2)}m`;
}
