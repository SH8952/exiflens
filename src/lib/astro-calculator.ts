export type AstroSensorPresetId =
  | "full-frame"
  | "aps-c"
  | "micro-four-thirds"
  | "one-inch"
  | "medium-format";

export type AstroSensorPreset = {
  id: AstroSensorPresetId;
  label: string;
  sensorWidthMm: number;
  /** Full-frame-equivalent crop factor, used by the 500 rule. */
  cropFactor: number;
  /** Width:height aspect ratio, used to derive horizontal pixel count from megapixels. */
  aspectRatio: number;
};

export const ASTRO_SENSOR_PRESETS: AstroSensorPreset[] = [
  { id: "full-frame", label: "Full Frame (36×24mm)", sensorWidthMm: 36, cropFactor: 1, aspectRatio: 3 / 2 },
  { id: "aps-c", label: "APS-C (~23.5×15.6mm)", sensorWidthMm: 23.5, cropFactor: 1.5, aspectRatio: 3 / 2 },
  {
    id: "micro-four-thirds",
    label: "Micro Four Thirds (17.3×13mm)",
    sensorWidthMm: 17.3,
    cropFactor: 2,
    aspectRatio: 4 / 3,
  },
  { id: "one-inch", label: "1-inch (13.2×8.8mm)", sensorWidthMm: 13.2, cropFactor: 2.7, aspectRatio: 3 / 2 },
  {
    id: "medium-format",
    label: "Medium Format (44×33mm)",
    sensorWidthMm: 43.8,
    cropFactor: 0.79,
    aspectRatio: 4 / 3,
  },
];

export type MegapixelPresetId = "24mp" | "33mp" | "45mp" | "50mp" | "61mp";

export type MegapixelPreset = {
  id: MegapixelPresetId;
  megapixels: number;
  /** Representative current mirrorless models at roughly this resolution, for the dropdown label. */
  exampleModels: string;
};

/**
 * Representative resolution tiers, each anchored to real current
 * mirrorless models' actual megapixel counts (not round numbers) so the
 * pixel-pitch math reflects real sensors: Canon R6 Mark II/Sony A7
 * III/Nikon Z6III (~24MP), Sony A7 IV/Canon R6 Mark III (~33MP), Canon R5
 * Mark II/Nikon Z8/Z9 (~45MP), Fuji GFX50S II medium format (~50MP), and
 * Sony A7R V/VI (~61MP).
 */
export const MEGAPIXEL_PRESETS: MegapixelPreset[] = [
  { id: "24mp", megapixels: 24.2, exampleModels: "Canon R6 Mark II · Sony A7 III · Nikon Z6III" },
  { id: "33mp", megapixels: 33, exampleModels: "Sony A7 IV · Canon R6 Mark III" },
  { id: "45mp", megapixels: 45, exampleModels: "Canon R5 Mark II · Nikon Z8/Z9" },
  { id: "50mp", megapixels: 51.4, exampleModels: "Fuji GFX50S II" },
  { id: "61mp", megapixels: 61, exampleModels: "Sony A7R V/VI" },
];

export const APERTURE_PRESETS = [1.4, 1.8, 2, 2.8, 4, 5.6, 8];

export const DEFAULT_FOCAL_LENGTH_MM = 24;
export const DEFAULT_APERTURE = 2.8;
export const DEFAULT_SENSOR_ID: AstroSensorPresetId = "full-frame";
export const DEFAULT_MEGAPIXEL_ID: MegapixelPresetId = "45mp";

/**
 * Horizontal pixel count implied by a total megapixel count and the
 * sensor's aspect ratio: width_px * height_px = megapixels * 1e6, and
 * width_px / height_px = aspectRatio, so width_px = sqrt(MP * 1e6 * ratio).
 */
export function calculateHorizontalPixels(megapixels: number, aspectRatio: number): number {
  return Math.sqrt(megapixels * 1_000_000 * aspectRatio);
}

/** Pixel pitch in micrometers: physical sensor width divided by horizontal pixel count. */
export function calculatePixelPitchMicrons(sensorWidthMm: number, horizontalPixels: number): number {
  return (sensorWidthMm / horizontalPixels) * 1000;
}

/**
 * The classic "500 rule" rule of thumb: divide 500 by the full-frame
 * equivalent focal length (actual focal length × crop factor) to get the
 * longest shutter speed, in seconds, before stars visibly trail.
 */
export function calculate500Rule(focalLengthMm: number, cropFactor: number): number | null {
  if (!Number.isFinite(focalLengthMm) || focalLengthMm <= 0 || !Number.isFinite(cropFactor) || cropFactor <= 0) {
    return null;
  }
  return 500 / (focalLengthMm * cropFactor);
}

/**
 * Simplified "NPF rule" (Frédéric Michaud / PhotoPills), which accounts
 * for aperture and pixel pitch rather than just focal length, making it
 * more accurate on today's high-resolution sensors:
 *   t = (35 * N + 30 * p) / f
 * where N is the f-number, p is pixel pitch in micrometers, and f is the
 * actual (not equivalent) focal length in millimeters.
 */
export function calculateNpfRule(
  focalLengthMm: number,
  aperture: number,
  pixelPitchMicrons: number,
): number | null {
  if (
    !Number.isFinite(focalLengthMm) ||
    focalLengthMm <= 0 ||
    !Number.isFinite(aperture) ||
    aperture <= 0 ||
    !Number.isFinite(pixelPitchMicrons) ||
    pixelPitchMicrons <= 0
  ) {
    return null;
  }
  return (35 * aperture + 30 * pixelPitchMicrons) / focalLengthMm;
}

export function formatExposureSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  return `${Math.round(seconds)}s`;
}
