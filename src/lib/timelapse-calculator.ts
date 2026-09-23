export type ShootPlanMode =
  | "intervalAndDuration"
  | "intervalAndShots"
  | "durationAndShots";

export const FPS_PRESETS = [24, 25, 30, 50, 60];

export const DEFAULT_INTERVAL_SECONDS = 5;
export const DEFAULT_DURATION_MINUTES = 60;
export const DEFAULT_SHOT_COUNT = 720;
export const DEFAULT_FPS = 24;
export const DEFAULT_FILE_SIZE_MB = 25;
export const DEFAULT_SHUTTER_SPEED_SECONDS = 1 / 50;

export type ShootPlanInput = {
  mode: ShootPlanMode;
  intervalSeconds?: number;
  durationSeconds?: number;
  shotCount?: number;
};

export type ShootPlanResult = {
  intervalSeconds: number;
  durationSeconds: number;
  shotCount: number;
};

/**
 * The three core timelapse-shoot quantities are related by a single
 * reciprocal formula (shotCount = durationSeconds / intervalSeconds), so
 * knowing any two always determines the third.
 */
export function calculateShootPlan(input: ShootPlanInput): ShootPlanResult | null {
  const { mode, intervalSeconds, durationSeconds, shotCount } = input;

  if (mode === "intervalAndDuration") {
    if (
      !Number.isFinite(intervalSeconds) ||
      (intervalSeconds as number) <= 0 ||
      !Number.isFinite(durationSeconds) ||
      (durationSeconds as number) <= 0
    ) {
      return null;
    }
    const shots = Math.floor((durationSeconds as number) / (intervalSeconds as number));
    if (shots < 1) return null;
    return {
      intervalSeconds: intervalSeconds as number,
      durationSeconds: durationSeconds as number,
      shotCount: shots,
    };
  }

  if (mode === "intervalAndShots") {
    if (
      !Number.isFinite(intervalSeconds) ||
      (intervalSeconds as number) <= 0 ||
      !Number.isFinite(shotCount) ||
      (shotCount as number) < 1
    ) {
      return null;
    }
    const shots = Math.floor(shotCount as number);
    return {
      intervalSeconds: intervalSeconds as number,
      durationSeconds: (intervalSeconds as number) * shots,
      shotCount: shots,
    };
  }

  // durationAndShots
  if (
    !Number.isFinite(durationSeconds) ||
    (durationSeconds as number) <= 0 ||
    !Number.isFinite(shotCount) ||
    (shotCount as number) < 1
  ) {
    return null;
  }
  const shots = Math.floor(shotCount as number);
  return {
    intervalSeconds: (durationSeconds as number) / shots,
    durationSeconds: durationSeconds as number,
    shotCount: shots,
  };
}

export function calculateVideoDurationSeconds(shotCount: number, fps: number): number | null {
  if (!Number.isFinite(shotCount) || shotCount <= 0 || !Number.isFinite(fps) || fps <= 0) {
    return null;
  }
  return shotCount / fps;
}

/** Total storage needed for the shoot, given an estimated size per photo. */
export function calculateStorageGb(shotCount: number, fileSizeMb: number): number | null {
  if (
    !Number.isFinite(shotCount) ||
    shotCount <= 0 ||
    !Number.isFinite(fileSizeMb) ||
    fileSizeMb <= 0
  ) {
    return null;
  }
  return (shotCount * fileSizeMb) / 1024;
}

export type ShutterAngleQuality = "choppy" | "cinematic" | "smooth";

export type ShutterAngleResult = {
  ratioPercent: number;
  angleDegrees: number;
  quality: ShutterAngleQuality;
};

/**
 * The ratio of shutter (exposure) time to the interval between frames
 * determines how much motion blur each frame carries, which is what
 * makes a played-back timelapse look smooth or "strobe-like". Expressed
 * both as a percentage of the interval and as the classic cinematography
 * "shutter angle" (percentage * 360°, since a 100% ratio is a full
 * rotation of a mechanical shutter disc).
 */
export function calculateShutterAngle(
  shutterSpeedSeconds: number,
  intervalSeconds: number,
): ShutterAngleResult | null {
  if (
    !Number.isFinite(shutterSpeedSeconds) ||
    shutterSpeedSeconds <= 0 ||
    !Number.isFinite(intervalSeconds) ||
    intervalSeconds <= 0
  ) {
    return null;
  }
  const ratio = Math.min(1, shutterSpeedSeconds / intervalSeconds);
  const ratioPercent = ratio * 100;
  const angleDegrees = ratio * 360;

  let quality: ShutterAngleQuality = "cinematic";
  if (ratioPercent < 30) quality = "choppy";
  else if (ratioPercent > 70) quality = "smooth";

  return { ratioPercent, angleDegrees, quality };
}

export function formatDurationHms(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

export function formatSeconds(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value < 1) return `${value.toFixed(2)}s`;
  if (value < 60) return `${value.toFixed(1)}s`;
  return formatDurationHms(value);
}

export function formatGb(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value < 1) return `${(value * 1024).toFixed(0)} MB`;
  return `${value.toFixed(2)} GB`;
}
