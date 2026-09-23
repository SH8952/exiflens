export type StorageFormatPresetId = "jpeg" | "raw-compressed" | "raw-uncompressed" | "custom";

export type StorageFormatPreset = {
  id: StorageFormatPresetId;
  /** Approximate file size for a typical ~24–45MP full-frame/APS-C shot in this format. */
  mbPerShot: number;
};

export const STORAGE_FORMAT_PRESETS: StorageFormatPreset[] = [
  { id: "jpeg", mbPerShot: 8 },
  { id: "raw-compressed", mbPerShot: 30 },
  { id: "raw-uncompressed", mbPerShot: 65 },
];

export const CUSTOM_FORMAT_ID: StorageFormatPresetId = "custom";

export type MemoryCardPreset = {
  id: string;
  gb: number;
};

export const MEMORY_CARD_PRESETS: MemoryCardPreset[] = [
  { id: "64gb", gb: 64 },
  { id: "128gb", gb: 128 },
  { id: "256gb", gb: 256 },
  { id: "512gb", gb: 512 },
  { id: "1tb", gb: 1000 },
  { id: "2tb", gb: 2000 },
];

export const DEFAULT_FILE_SIZE_MB = 30;
export const DEFAULT_SHOT_COUNT = 500;
export const DEFAULT_DAILY_SHOT_COUNT = 300;
export const DEFAULT_DAYS = 5;
export const DEFAULT_BACKUP_COPIES = 1;
export const DEFAULT_CARD_GB = 128;
export const DEFAULT_UPLOAD_MBPS = 100;

export type ShotCountMode = "direct" | "daily";

/**
 * Total shots either taken directly from a shot-count input, or derived
 * from an average daily shot count over a trip/project's length in days
 * (the "advanced" trip-planning mode).
 */
export function calculateTotalShots({
  mode,
  directShotCount,
  dailyShotCount,
  days,
}: {
  mode: ShotCountMode;
  directShotCount: number;
  dailyShotCount: number;
  days: number;
}): number | null {
  if (mode === "direct") {
    if (!Number.isFinite(directShotCount) || directShotCount <= 0) return null;
    return directShotCount;
  }
  if (
    !Number.isFinite(dailyShotCount) ||
    dailyShotCount <= 0 ||
    !Number.isFinite(days) ||
    days <= 0
  ) {
    return null;
  }
  return dailyShotCount * days;
}

export type StoragePlan = {
  /** Total storage needed for the shoot itself, before any backup copies. */
  originalGb: number;
  /** Total storage needed including backup copies (originalGb × (1 + backupCopies)). */
  totalGb: number;
  cardsNeeded: number;
};

/**
 * Total storage needed for `totalShots` frames at `fileSizeMb` each, plus
 * `backupCopies` additional full copies (e.g. 1 = one backup copy besides
 * the original, matching a common "3-2-1"-style backup habit), and how
 * many `cardGb`-sized cards/drives that requires.
 */
export function calculateStoragePlan({
  fileSizeMb,
  totalShots,
  backupCopies,
  cardGb,
}: {
  fileSizeMb: number;
  totalShots: number;
  backupCopies: number;
  cardGb: number;
}): StoragePlan | null {
  if (
    !Number.isFinite(fileSizeMb) ||
    fileSizeMb <= 0 ||
    !Number.isFinite(totalShots) ||
    totalShots <= 0 ||
    !Number.isFinite(backupCopies) ||
    backupCopies < 0 ||
    !Number.isFinite(cardGb) ||
    cardGb <= 0
  ) {
    return null;
  }

  const originalGb = (fileSizeMb * totalShots) / 1000;
  const totalGb = originalGb * (1 + backupCopies);
  const cardsNeeded = Math.ceil(totalGb / cardGb);

  return { originalGb, totalGb, cardsNeeded };
}

/**
 * Estimated upload time for `totalGb` of data at `uploadMbps` (megabits
 * per second, as ISPs quote upload speed). Uses the decimal convention
 * (1GB = 8000Mb) that matches how network speeds are advertised, so the
 * estimate lines up with what a real upload would show.
 */
export function calculateUploadTimeSeconds(totalGb: number, uploadMbps: number): number | null {
  if (!Number.isFinite(totalGb) || totalGb <= 0 || !Number.isFinite(uploadMbps) || uploadMbps <= 0) {
    return null;
  }
  const totalMegabits = totalGb * 8000;
  return totalMegabits / uploadMbps;
}

export function formatGb(gb: number): string {
  if (!Number.isFinite(gb) || gb < 0) return "—";
  if (gb >= 1000) return `${(gb / 1000).toFixed(2)}TB`;
  return `${gb.toFixed(1)}GB`;
}

export function formatShotCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return "—";
  return Math.round(count).toLocaleString();
}

export function formatUploadTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}
