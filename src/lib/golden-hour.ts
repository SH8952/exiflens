import { getTimes } from "suncalc";

/**
 * Golden hour / blue hour boundaries, derived from SunCalc's sun-altitude
 * events (Jean Meeus astronomical formulas — see suncalc's own source for
 * the exact angle table). Definitions match common photography usage
 * (e.g. PhotoPills):
 *   - Morning blue hour:  dawn (-6°)        -> sunrise (-0.833°)
 *   - Morning golden hour: sunrise           -> goldenHourEnd (+6°)
 *   - Evening golden hour: goldenHour (+6°)  -> sunset
 *   - Evening blue hour:   sunset            -> dusk (-6°)
 *
 * All returned Date objects are UTC instants (as SunCalc always returns);
 * the caller formats them with the browser's own locale/timezone via
 * toLocaleTimeString, which is accurate for the user's own location but
 * will show times in the browser's timezone (not the queried location's)
 * if the coordinates are for a different region — this limitation is
 * surfaced to the user in the UI copy, not hidden here.
 */
export type GoldenBlueHourTimes = {
  morningBlueHourStart: Date | null;
  morningBlueHourEnd: Date | null;
  morningGoldenHourStart: Date | null;
  morningGoldenHourEnd: Date | null;
  eveningGoldenHourStart: Date | null;
  eveningGoldenHourEnd: Date | null;
  eveningBlueHourStart: Date | null;
  eveningBlueHourEnd: Date | null;
  /** Sun never dips low enough today (polar day) — none of the above occur. */
  alwaysUp: boolean;
  /** Sun never rises high enough today (polar night) — none of the above occur. */
  alwaysDown: boolean;
};

const MAX_LATITUDE = 90;
const MIN_LATITUDE = -90;
const MAX_LONGITUDE = 180;
const MIN_LONGITUDE = -180;

export function isValidLatitude(lat: number): boolean {
  return Number.isFinite(lat) && lat >= MIN_LATITUDE && lat <= MAX_LATITUDE;
}

export function isValidLongitude(lng: number): boolean {
  return Number.isFinite(lng) && lng >= MIN_LONGITUDE && lng <= MAX_LONGITUDE;
}

export function calculateGoldenBlueHour(
  date: Date,
  latitude: number,
  longitude: number,
): GoldenBlueHourTimes {
  const times = getTimes(date, latitude, longitude);

  return {
    morningBlueHourStart: times.dawn,
    morningBlueHourEnd: times.sunrise,
    morningGoldenHourStart: times.sunrise,
    morningGoldenHourEnd: times.goldenHourEnd,
    eveningGoldenHourStart: times.goldenHour,
    eveningGoldenHourEnd: times.sunset,
    eveningBlueHourStart: times.sunset,
    eveningBlueHourEnd: times.dusk,
    alwaysUp: times.alwaysUp ?? false,
    alwaysDown: times.alwaysDown ?? false,
  };
}
