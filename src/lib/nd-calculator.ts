export type NdFilterId =
  | "nd4"
  | "nd8"
  | "nd64"
  | "nd1000"
  | "nd32000"
  | "custom";

export type NdFilterPreset = {
  id: NdFilterId;
  label: string;
  stops: number | null; // null for "custom" — stops come from user input
};

/** ND filter presets in ascending density, matching the spec's Phase 3 list. */
export const ND_FILTERS: NdFilterPreset[] = [
  { id: "nd4", label: "ND4 (2-stop)", stops: 2 },
  { id: "nd8", label: "ND8 (3-stop)", stops: 3 },
  { id: "nd64", label: "ND64 (6-stop)", stops: 6 },
  { id: "nd1000", label: "ND1000 (10-stop)", stops: 10 },
  { id: "nd32000", label: "ND32000 (15-stop)", stops: 15 },
  { id: "custom", label: "Custom stops", stops: null },
];

export const MIN_CUSTOM_STOPS = 1;
export const MAX_CUSTOM_STOPS = 21; // ND4,000,000-ish — generous upper bound

/** Standard full-stop shutter speeds from 1/1000s to 30s, in seconds. */
export const BASE_SHUTTER_SPEEDS_SECONDS: number[] = [
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

export const DEFAULT_BASE_SHUTTER_SECONDS = 1 / 125;

/** T_new = T_base × 2^stops */
export function calculateExposureSeconds(
  baseSeconds: number,
  stops: number,
): number {
  if (!Number.isFinite(baseSeconds) || baseSeconds <= 0) return 0;
  if (!Number.isFinite(stops) || stops < 0) return baseSeconds;
  return baseSeconds * Math.pow(2, stops);
}

/**
 * Formats a (potentially very long, for high-stop ND filters) exposure
 * duration in a human-readable way: "8.2s", "2m 15s", "1h 5m", "3d 2h".
 */
export function formatExposureDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";

  if (totalSeconds < 1) {
    const denominator = Math.round(1 / totalSeconds);
    return `1/${denominator}s`;
  }

  if (totalSeconds < 60) {
    const rounded = Math.round(totalSeconds * 10) / 10;
    return `${rounded}s`;
  }

  const totalWholeSeconds = Math.round(totalSeconds);
  const days = Math.floor(totalWholeSeconds / 86400);
  const hours = Math.floor((totalWholeSeconds % 86400) / 3600);
  const minutes = Math.floor((totalWholeSeconds % 3600) / 60);
  const seconds = totalWholeSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

/** mm:ss (or hh:mm:ss for long exposures) for the live countdown display. */
export function formatCountdownClock(remainingSeconds: number): string {
  const clamped = Math.max(0, Math.ceil(remainingSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
