/**
 * Flash guide number (GN) math — the classic, decades-old flash exposure
 * formula manufacturers still publish for every flash unit:
 *
 *   Guide Number = f-number x distance   (at a stated reference ISO, usually ISO 100)
 *
 * Rearranged, this gives whichever of the three values you don't already
 * know:
 *   f-number = GN / distance
 *   distance = GN / f-number
 *
 * Guide numbers scale with sensitivity as the square root of the ISO ratio
 * (doubling ISO only needs ~41% more guide number, not double), the same
 * public-domain relationship documented on Wikipedia's "Guide number"
 * article and used by every manufacturer's GN chart.
 */

export const REFERENCE_ISO = 100;

export const METERS_TO_FEET = 3.28084;

export type DistanceUnit = "m" | "ft";

export function convertDistance(
  distance: number,
  fromUnit: DistanceUnit,
  toUnit: DistanceUnit,
): number {
  if (fromUnit === toUnit) return distance;
  return fromUnit === "m" ? distance * METERS_TO_FEET : distance / METERS_TO_FEET;
}

/** Scales a guide number given at `baseIso` to its equivalent at `targetIso`. */
export function calculateGuideNumberAtIso(
  baseGuideNumber: number,
  baseIso: number,
  targetIso: number,
): number | null {
  if (
    !Number.isFinite(baseGuideNumber) ||
    baseGuideNumber <= 0 ||
    !Number.isFinite(baseIso) ||
    baseIso <= 0 ||
    !Number.isFinite(targetIso) ||
    targetIso <= 0
  ) {
    return null;
  }
  return baseGuideNumber * Math.sqrt(targetIso / baseIso);
}

export function calculateApertureFromGuideNumber(
  guideNumber: number,
  distance: number,
): number | null {
  if (
    !Number.isFinite(guideNumber) ||
    guideNumber <= 0 ||
    !Number.isFinite(distance) ||
    distance <= 0
  ) {
    return null;
  }
  return guideNumber / distance;
}

export function calculateDistanceFromGuideNumber(
  guideNumber: number,
  aperture: number,
): number | null {
  if (
    !Number.isFinite(guideNumber) ||
    guideNumber <= 0 ||
    !Number.isFinite(aperture) ||
    aperture <= 0
  ) {
    return null;
  }
  return guideNumber / aperture;
}

export function formatDistance(distance: number, unit: DistanceUnit): string {
  if (!Number.isFinite(distance)) return "—";
  const suffix = unit === "m" ? "m" : "ft";
  return `${distance.toFixed(distance >= 10 ? 1 : 2)}${suffix}`;
}

export function formatGuideNumber(guideNumber: number, unit: DistanceUnit): string {
  if (!Number.isFinite(guideNumber)) return "—";
  const suffix = unit === "m" ? "m" : "ft";
  return `${guideNumber.toFixed(1)}${suffix}`;
}
