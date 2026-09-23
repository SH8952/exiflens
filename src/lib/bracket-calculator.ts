import type { ExposureParam } from "@/lib/exposure-calculator";

/** Common bracketing step sizes offered as presets, in stops. */
export const BRACKET_STEP_STOPS_OPTIONS = [1 / 3, 1 / 2, 1, 2];

/** Odd frame counts only, so there's always a centered "0 EV" baseline frame. */
export const BRACKET_FRAME_COUNT_OPTIONS = [3, 5, 7, 9];

export const DEFAULT_BRACKET_PARAM: ExposureParam = "shutterSpeed";
export const DEFAULT_BRACKET_STEP_STOPS = 1;
export const DEFAULT_BRACKET_FRAME_COUNT = 5;
/** Typical mirrorless/DSLR buffer-clear + shutter-cocking time between bracketed shots. */
export const DEFAULT_OVERHEAD_SECONDS_PER_SHOT = 1.5;

export type DynamicRangeCategory = "standard" | "highContrast" | "extreme";

export type BracketFrame = {
  /** Stops relative to the baseline (0 = baseline frame), positive = brighter. */
  offsetStops: number;
  aperture: number;
  shutterSpeedSeconds: number;
  iso: number;
};

export type BracketPlanInput = {
  baselineAperture: number;
  baselineShutterSpeedSeconds: number;
  baselineIso: number;
  bracketParam: ExposureParam;
  stepStops: number;
  frameCount: number;
  overheadSecondsPerShot: number;
};

export type BracketPlanResult = {
  frames: BracketFrame[];
  /** Total EV range covered from darkest to brightest frame. */
  totalSpreadStops: number;
  dynamicRangeCategory: DynamicRangeCategory;
  totalShootingTimeSeconds: number;
};

/**
 * Value of a bracketed parameter `stopsOffset` stops brighter (positive) or
 * darker (negative) than `baseline`, matching the standard camera EV-bracket
 * convention (+EV = brighter frame). Shutter speed and ISO double per stop
 * (light scales linearly with either). Aperture's f-number scales by
 * sqrt(2) per stop but in the OPPOSITE direction — a wider aperture
 * (smaller f-number) lets in more light, since light scales with the
 * opening's area (∝ 1/N²), so a "+1 stop" (brighter) aperture frame means
 * dividing the f-number by sqrt(2).
 */
function offsetValue(
  param: ExposureParam,
  baseline: number,
  stopsOffset: number,
): number {
  if (param === "aperture") return baseline / Math.pow(Math.SQRT2, stopsOffset);
  return baseline * Math.pow(2, stopsOffset);
}

/**
 * Builds a symmetric EV-bracketing shot list: `frameCount` frames spaced
 * `stepStops` apart, centered on the baseline exposure (frame 0 = 0 EV),
 * varying exactly one of aperture/shutterSpeed/iso while holding the other
 * two fixed at their baseline values — the same "hold two, vary one"
 * approach as calculateExposureCompensation in exposure-calculator.ts, just
 * generating a whole bracket sequence instead of a single compensated
 * value.
 */
export function calculateBracketPlan({
  baselineAperture,
  baselineShutterSpeedSeconds,
  baselineIso,
  bracketParam,
  stepStops,
  frameCount,
  overheadSecondsPerShot,
}: BracketPlanInput): BracketPlanResult | null {
  if (
    !Number.isFinite(baselineAperture) ||
    baselineAperture <= 0 ||
    !Number.isFinite(baselineShutterSpeedSeconds) ||
    baselineShutterSpeedSeconds <= 0 ||
    !Number.isFinite(baselineIso) ||
    baselineIso <= 0 ||
    !Number.isFinite(stepStops) ||
    stepStops <= 0 ||
    !Number.isInteger(frameCount) ||
    frameCount < 3 ||
    frameCount % 2 === 0 ||
    !Number.isFinite(overheadSecondsPerShot) ||
    overheadSecondsPerShot < 0
  ) {
    return null;
  }

  const half = (frameCount - 1) / 2;
  const frames: BracketFrame[] = [];
  for (let i = 0; i < frameCount; i++) {
    const offsetStops = (i - half) * stepStops;
    frames.push({
      offsetStops,
      aperture:
        bracketParam === "aperture"
          ? offsetValue("aperture", baselineAperture, offsetStops)
          : baselineAperture,
      shutterSpeedSeconds:
        bracketParam === "shutterSpeed"
          ? offsetValue("shutterSpeed", baselineShutterSpeedSeconds, offsetStops)
          : baselineShutterSpeedSeconds,
      iso:
        bracketParam === "iso"
          ? offsetValue("iso", baselineIso, offsetStops)
          : baselineIso,
    });
  }

  const totalSpreadStops = (frameCount - 1) * stepStops;

  // Rule-of-thumb thresholds: most single-exposure JPEGs/RAWs already
  // capture ~4 stops of usable dynamic range cleanly, 4–8 stops is where
  // HDR merging starts meaningfully helping (backlit portraits, bright
  // sky + shaded foreground), and beyond ~8 stops is the "extreme" range
  // (sunset silhouettes, bright window + dark interior) where more/wider
  // brackets are worth considering.
  const dynamicRangeCategory: DynamicRangeCategory =
    totalSpreadStops < 4 ? "standard" : totalSpreadStops < 8 ? "highContrast" : "extreme";

  // Total exposure time only varies with shutter-speed bracketing; for
  // aperture/ISO bracketing every frame's shutter stays at the baseline,
  // so this naturally reduces to frameCount × baseline shutter speed.
  const totalExposureSeconds = frames.reduce((sum, f) => sum + f.shutterSpeedSeconds, 0);
  const totalShootingTimeSeconds = totalExposureSeconds + frameCount * overheadSecondsPerShot;

  return { frames, totalSpreadStops, dynamicRangeCategory, totalShootingTimeSeconds };
}

/** "1/3", "1/2", "1", "2" — plain, locale-agnostic stop-size label. */
export function formatStepStops(step: number): string {
  if (Math.abs(step - 1 / 3) < 1e-6) return "1/3";
  if (Math.abs(step - 1 / 2) < 1e-6) return "1/2";
  if (Number.isInteger(step)) return String(step);
  return step.toFixed(2);
}

/** "+1.33", "-0.67", "0" — signed stops offset, 2 decimal places max. */
export function formatStopsOffset(stops: number): string {
  const rounded = Math.round(stops * 100) / 100;
  if (rounded === 0) return "0";
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
}

export function formatShootingTimeSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = totalSeconds % 60;
  return `${minutes}m ${remainder}s`;
}
