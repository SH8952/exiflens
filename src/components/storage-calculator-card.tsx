"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSharePublish } from "@/lib/use-share-publish";
import {
  parseBoundedNumber,
  parseNumberChoice,
  parseStringChoice,
  readSharedParams,
} from "@/lib/shared-params";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CUSTOM_FORMAT_ID,
  DEFAULT_BACKUP_COPIES,
  DEFAULT_CARD_GB,
  DEFAULT_DAILY_SHOT_COUNT,
  DEFAULT_DAYS,
  DEFAULT_FILE_SIZE_MB,
  DEFAULT_SHOT_COUNT,
  DEFAULT_UPLOAD_MBPS,
  MEMORY_CARD_PRESETS,
  STORAGE_FORMAT_PRESETS,
  calculateStoragePlan,
  calculateTotalShots,
  calculateUploadTimeSeconds,
  formatGb,
  formatShotCount,
  formatUploadTime,
  type ShotCountMode,
  type StorageFormatPresetId,
} from "@/lib/storage-calculator";

export function StorageCalculatorCard() {
  const t = useTranslations("StorageCalculator");

  const [formatId, setFormatId] = React.useState<StorageFormatPresetId>("raw-compressed");
  const [customFileSizeMb, setCustomFileSizeMb] = React.useState(DEFAULT_FILE_SIZE_MB);

  const [shotCountMode, setShotCountMode] = React.useState<ShotCountMode>("direct");
  const [directShotCount, setDirectShotCount] = React.useState(DEFAULT_SHOT_COUNT);
  const [dailyShotCount, setDailyShotCount] = React.useState(DEFAULT_DAILY_SHOT_COUNT);
  const [days, setDays] = React.useState(DEFAULT_DAYS);

  const [backupCopies, setBackupCopies] = React.useState(DEFAULT_BACKUP_COPIES);
  const [cardGb, setCardGb] = React.useState(DEFAULT_CARD_GB);
  const [uploadMbps, setUploadMbps] = React.useState(DEFAULT_UPLOAD_MBPS);

  // 공유 링크로 들어온 경우 입력값을 채운다. 서버 렌더링 결과(기본값)와 첫 화면을 맞추기 위해
  // 마운트 직후 한 번만 읽고, 허용 범위·목록 밖의 값은 무시한다.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    const q = readSharedParams();
    if (!q) return;
    const fmt = parseStringChoice(
      q.get("fmt"),
      STORAGE_FORMAT_PRESETS.map((p) => p.id),
    );
    const fsm = parseBoundedNumber(q.get("fsm"), 0.1, 10000);
    const sm = parseStringChoice(q.get("sm"), ["direct", "daily"] as const);
    const ds = parseBoundedNumber(q.get("ds"), 1, 10000000);
    const dd = parseBoundedNumber(q.get("dd"), 1, 1000000);
    const dy = parseBoundedNumber(q.get("dy"), 1, 3650);
    const bk = parseBoundedNumber(q.get("bk"), 0, 20);
    const cg = parseNumberChoice(
      q.get("cg"),
      MEMORY_CARD_PRESETS.map((p) => p.gb),
    );
    const up = parseBoundedNumber(q.get("up"), 0.1, 100000);
    if (fmt !== null) setFormatId(fmt);
    if (fsm !== null) setCustomFileSizeMb(fsm);
    if (sm !== null) setShotCountMode(sm);
    if (ds !== null) setDirectShotCount(ds);
    if (dd !== null) setDailyShotCount(dd);
    if (dy !== null) setDays(dy);
    if (bk !== null) setBackupCopies(bk);
    if (cg !== null) setCardGb(cg);
    if (up !== null) setUploadMbps(up);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const fileSizeMb =
    formatId === CUSTOM_FORMAT_ID
      ? customFileSizeMb
      : STORAGE_FORMAT_PRESETS.find((f) => f.id === formatId)?.mbPerShot ?? DEFAULT_FILE_SIZE_MB;

  const totalShots = calculateTotalShots({
    mode: shotCountMode,
    directShotCount,
    dailyShotCount,
    days,
  });

  const plan =
    totalShots !== null
      ? calculateStoragePlan({ fileSizeMb, totalShots, backupCopies, cardGb })
      : null;

  const uploadSeconds = plan ? calculateUploadTimeSeconds(plan.totalGb, uploadMbps) : null;

  // 페이지 하단 공유 버튼이 쓸 현재 입력값(링크)과 결과 요약(문구)을 올린다.
  const shareQuery = new URLSearchParams({
    fmt: formatId,
    ...(formatId === CUSTOM_FORMAT_ID ? { fsm: String(customFileSizeMb) } : {}),
    sm: shotCountMode,
    ds: String(directShotCount),
    dd: String(dailyShotCount),
    dy: String(days),
    bk: String(backupCopies),
    cg: String(cardGb),
    up: String(uploadMbps),
  }).toString();
  const shareText =
    plan && totalShots !== null
      ? t("shareText", {
          fileSize: fileSizeMb,
          shots: formatShotCount(totalShots),
          backup: backupCopies,
          total: formatGb(plan.totalGb),
          cards: plan.cardsNeeded,
          cardGb,
        })
      : null;
  useSharePublish("/tools/storage-calculator", shareQuery, shareText);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>

      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("formatLabel")}</span>
          <Select value={formatId} onValueChange={(value) => setFormatId(value as StorageFormatPresetId)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STORAGE_FORMAT_PRESETS.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {t(`formatOption.${f.id}`, { mb: f.mbPerShot })}
                </SelectItem>
              ))}
              <SelectItem value={CUSTOM_FORMAT_ID}>{t("formatOption.custom")}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        {formatId === CUSTOM_FORMAT_ID ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("customFileSizeLabel")}</span>
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={customFileSizeMb}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setCustomFileSizeMb(next);
              }}
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("shotCountModeLabel")}</span>
          <Select value={shotCountMode} onValueChange={(value) => setShotCountMode(value as ShotCountMode)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">{t("shotCountModeDirect")}</SelectItem>
              <SelectItem value="daily">{t("shotCountModeDaily")}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        {shotCountMode === "direct" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("shotCountLabel")}</span>
            <Input
              type="number"
              min={1}
              value={directShotCount}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setDirectShotCount(next);
              }}
            />
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground">{t("dailyShotCountLabel")}</span>
              <Input
                type="number"
                min={1}
                value={dailyShotCount}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) setDailyShotCount(next);
                }}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground">{t("daysLabel")}</span>
              <Input
                type="number"
                min={1}
                value={days}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) setDays(next);
                }}
              />
            </label>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("cardSizeLabel")}</span>
          <Select value={String(cardGb)} onValueChange={(value) => setCardGb(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEMORY_CARD_PRESETS.map((c) => (
                <SelectItem key={c.id} value={String(c.gb)}>
                  {formatGb(c.gb)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {plan && totalShots !== null ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <Row label={t("totalShotsLabel")} value={formatShotCount(totalShots)} />
            <Row label={t("requiredStorageLabel")} value={formatGb(plan.totalGb)} emphasize />
            <Row label={t("cardsNeededLabel")} value={t("cardsNeededValue", { count: plan.cardsNeeded })} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}

        <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border px-3 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("advancedTitle")}
          </h3>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("backupCopiesLabel")}</span>
            <Input
              type="number"
              min={0}
              step={1}
              value={backupCopies}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setBackupCopies(next);
              }}
            />
            <span className="text-xs text-muted-foreground">
              {t("backupCopiesHint", { total: backupCopies + 1 })}
            </span>
          </label>

          {plan ? (
            <Row label={t("originalStorageLabel")} value={formatGb(plan.originalGb)} />
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("uploadSpeedLabel")}</span>
            <Input
              type="number"
              min={1}
              value={uploadMbps}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setUploadMbps(next);
              }}
            />
          </label>

          {uploadSeconds !== null ? (
            <Row label={t("uploadTimeLabel")} value={formatUploadTime(uploadSeconds)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasize ? "text-lg font-semibold text-primary" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
