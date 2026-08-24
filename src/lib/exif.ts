import ExifReader from "exifreader";

export type ParsedExif = {
  fileName: string;
  camera: string | null;
  lens: string | null;
  shutterSpeedLabel: string | null;
  /** Base shutter speed converted to seconds, used by the ND filter calculator. */
  shutterSpeedSeconds: number | null;
  aperture: string | null;
  iso: string | null;
  focalLength: string | null;
  /** Date the photo was taken, formatted "YYYY-MM-DD" (used by the EXIF frame generator). */
  takenAt: string | null;
};

const ACCEPTED_MIME_PREFIXES = ["image/"];
// Common camera RAW extensions that browsers often report with an empty/octet-stream MIME type.
const ACCEPTED_RAW_EXTENSIONS = [
  ".arw",
  ".cr2",
  ".cr3",
  ".nef",
  ".raf",
  ".rw2",
  ".orf",
  ".dng",
  ".pef",
  ".srw",
];

export function isSupportedImageFile(file: File): boolean {
  if (ACCEPTED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
    return true;
  }
  const name = file.name.toLowerCase();
  return ACCEPTED_RAW_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/** Formats a rational EXIF value (e.g. shutter speed [1, 125]) as seconds. */
function rationalToSeconds(value: [number, number] | undefined): number | null {
  if (!value || value[1] === 0) return null;
  return value[0] / value[1];
}

/**
 * Formats a shutter speed given in seconds the way photographers read it:
 * a fraction below 1 second (e.g. "1/125s"), a decimal above (e.g. "8.2s").
 * Shared by the EXIF panel and the ND filter calculator's base-speed picker.
 */
export function formatShutterSpeed(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return null;
  if (seconds >= 1) {
    const rounded = Math.round(seconds * 10) / 10;
    return `${rounded}s`;
  }
  const denominator = Math.round(1 / seconds);
  return `1/${denominator}s`;
}

function formatAperture(value: [number, number] | undefined): string | null {
  const decimal = rationalToSeconds(value);
  if (decimal === null) return null;
  return `f/${decimal.toFixed(1)}`;
}

function formatFocalLength(value: [number, number] | undefined): string | null {
  const mm = rationalToSeconds(value);
  if (mm === null) return null;
  return `${Math.round(mm)}mm`;
}

function firstString(value: string[] | string | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

/**
 * EXIF stores dates as "YYYY:MM:DD HH:MM:SS". Reformats to "YYYY-MM-DD" for
 * display on the EXIF frame generator's photo caption.
 */
function formatTakenDate(value: string | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4}):(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}

/**
 * Combines the EXIF Make and Model fields into a single camera name,
 * avoiding duplication for brands (e.g. Canon, Panasonic) whose Model
 * field already includes the manufacturer name, e.g. "Canon EOS R7".
 */
function combineMakeAndModel(
  make: string | null,
  model: string | null,
): string | null {
  if (!make) return model;
  if (!model) return make;
  if (model.toLowerCase().startsWith(make.toLowerCase())) return model;
  return `${make} ${model}`;
}

/**
 * Parses EXIF metadata from an image file entirely in the browser.
 * The file's bytes never leave the client — no network request is made.
 */
export async function parseExifFile(file: File): Promise<ParsedExif> {
  const tags = await ExifReader.load(file, { expanded: true });
  const exif = tags.exif ?? {};

  const cameraMake = firstString(exif.Make?.value as string[] | string | undefined);
  const cameraModel = firstString(exif.Model?.value as string[] | string | undefined);
  const camera = combineMakeAndModel(cameraMake, cameraModel);

  const lens = firstString(exif.LensModel?.value as string[] | string | undefined);

  const shutterSeconds = rationalToSeconds(
    exif.ExposureTime?.value as [number, number] | undefined,
  );

  const iso = exif.ISOSpeedRatings
    ? String(
        Array.isArray(exif.ISOSpeedRatings.value)
          ? exif.ISOSpeedRatings.value[0]
          : exif.ISOSpeedRatings.value,
      )
    : null;

  const takenAt = formatTakenDate(
    firstString(exif.DateTimeOriginal?.value as string[] | string | undefined) ??
      undefined,
  );

  return {
    fileName: file.name,
    camera,
    lens,
    shutterSpeedLabel: formatShutterSpeed(shutterSeconds),
    shutterSpeedSeconds: shutterSeconds,
    aperture: formatAperture(exif.FNumber?.value as [number, number] | undefined),
    iso,
    focalLength: formatFocalLength(exif.FocalLength?.value as [number, number] | undefined),
    takenAt,
  };
}

export class ExifParseError extends Error {}
