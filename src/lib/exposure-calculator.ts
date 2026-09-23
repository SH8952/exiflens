export type ExposureParam = "aperture" | "shutterSpeed" | "iso";

/**
 * Common full-stop aperture, shutter speed, and ISO values — the same
 * "click stops" most cameras expose, used both as select-box presets and
 * as the values snapped-to when displaying a computed result.
 */
export const APERTURE_STOPS = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32];

export const ISO_STOPS = [
  50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400,
];

/** Shutter speeds in seconds, fast → slow, one full stop apart. */
export const SHUTTER_SPEED_STOPS_SECONDS = [
  1 / 8000,
  1 / 4000,
  1 / 2000,
  1 / 1000,
  1 / 500,
  1 / 250,
  1 / 125,
  1 / 60,
  1 / 30,
  1 / 15,
  1 / 8,
  1 / 4,
  1 / 2,
  1,
  2,
  4,
  8,
  15,
  30,
];

export const DEFAULT_APERTURE = 4;
export const DEFAULT_SHUTTER_SPEED_SECONDS = 1 / 125;
export const DEFAULT_ISO = 400;

export function formatAperture(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  const rounded = Math.round(value * 10) / 10;
  return `f/${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}`;
}

export function formatIso(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `ISO ${Math.round(value)}`;
}

export function formatShutterSpeed(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  if (seconds >= 1) {
    const rounded = Math.round(seconds * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}s`;
  }
  const denominator = Math.round(1 / seconds);
  return `1/${denominator}`;
}

export function formatExposureValue(
  param: ExposureParam,
  value: number,
): string {
  if (param === "aperture") return formatAperture(value);
  if (param === "shutterSpeed") return formatShutterSpeed(value);
  return formatIso(value);
}

/**
 * Each parameter's contribution to total scene brightness, expressed in a
 * shared log2 ("stops") scale: doubling shutter time, doubling ISO, or
 * halving the f-number (going from f/4 to f/2.8) each add exactly one
 * stop of light. Aperture uses a factor of 2 because light scales with
 * the *area* of the opening (∝ 1/N²), not the f-number itself.
 */
function contribution(param: ExposureParam, value: number): number {
  if (param === "aperture") return -2 * Math.log2(value);
  return Math.log2(value); // shutterSpeed and iso both add light linearly with value
}

export type ExposureBaseline = {
  aperture: number;
  shutterSpeedSeconds: number;
  iso: number;
};

export type ExposureCompensationInput = {
  baseline: ExposureBaseline;
  changedParam: ExposureParam;
  newValue: number;
  compensateParam: ExposureParam;
};

export type ExposureCompensationResult = {
  fixedParam: ExposureParam;
  fixedValue: number;
  compensateValue: number;
  /** Absolute stop change of the parameter the user directly changed. */
  stopsChanged: number;
};

function baselineValueOf(baseline: ExposureBaseline, param: ExposureParam): number {
  if (param === "aperture") return baseline.aperture;
  if (param === "shutterSpeed") return baseline.shutterSpeedSeconds;
  return baseline.iso;
}

/**
 * Given a known-good baseline exposure (aperture/shutter/ISO that already
 * produces the desired brightness) and a single parameter the
 * photographer wants to change to a new value, solves for the value one
 * other chosen parameter must take (holding the third parameter fixed at
 * its baseline value) so the resulting exposure stays equivalent — i.e.
 * the same total light reaches the sensor.
 */
export function calculateExposureCompensation({
  baseline,
  changedParam,
  newValue,
  compensateParam,
}: ExposureCompensationInput): ExposureCompensationResult | null {
  if (changedParam === compensateParam) return null;
  if (!Number.isFinite(newValue) || newValue <= 0) return null;
  if (
    !Number.isFinite(baseline.aperture) ||
    baseline.aperture <= 0 ||
    !Number.isFinite(baseline.shutterSpeedSeconds) ||
    baseline.shutterSpeedSeconds <= 0 ||
    !Number.isFinite(baseline.iso) ||
    baseline.iso <= 0
  ) {
    return null;
  }

  const allParams: ExposureParam[] = ["aperture", "shutterSpeed", "iso"];
  const fixedParam = allParams.find(
    (p) => p !== changedParam && p !== compensateParam,
  );
  if (!fixedParam) return null;

  const fixedValue = baselineValueOf(baseline, fixedParam);

  const baselineStops =
    contribution("aperture", baseline.aperture) +
    contribution("shutterSpeed", baseline.shutterSpeedSeconds) +
    contribution("iso", baseline.iso);

  const knownStops = contribution(changedParam, newValue) + contribution(fixedParam, fixedValue);
  const targetContribution = baselineStops - knownStops;

  const compensateValue =
    compensateParam === "aperture"
      ? Math.pow(2, -targetContribution / 2)
      : Math.pow(2, targetContribution);

  if (!Number.isFinite(compensateValue) || compensateValue <= 0) return null;

  const changedBaselineValue = baselineValueOf(baseline, changedParam);
  const stopsChanged = Math.abs(
    contribution(changedParam, newValue) - contribution(changedParam, changedBaselineValue),
  );

  return { fixedParam, fixedValue, compensateValue, stopsChanged };
}
