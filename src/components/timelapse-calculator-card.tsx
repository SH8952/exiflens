"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_DURATION_MINUTES,
  DEFAULT_FILE_SIZE_MB,
  DEFAULT_FPS,
  DEFAULT_INTERVAL_SECONDS,
  DEFAULT_SHOT_COUNT,
  DEFAULT_SHUTTER_SPEED_SECONDS,
  FPS_PRESETS,
  calculateShootPlan,
  calculateShutterAngle,
  calculateStorageGb,
  calculateVideoDurationSeconds,
  formatDurationHms,
  formatGb,
  formatSeconds,
  type ShootPlanMode,
} from "@/lib/timelapse-calculator";
import {
  SHUTTER_SPEED_STOPS_SECONDS,
  formatShutterSpeed,
} from "@/lib/exposure-calculator";

const MODES: ShootPlanMode[] = ["intervalAndDuration", "intervalAndShots", "durationAndShots"];

export function TimelapseCalculatorCard() {
  const t = useTranslations("TimelapseCalculator");

  const [mode, setMode] = React.useState<ShootPlanMode>("intervalAndDuration");
  const [intervalSeconds, setIntervalSeconds] = React.useState(DEFAULT_INTERVAL_SECONDS);
  const [durationMinutes, setDurationMinutes] = React.useState(DEFAULT_DURATION_MINUTES);
  const [shotCount, setShotCount] = React.useState(DEFAULT_SHOT_COUNT);
  const [fps, setFps] = React.useState(DEFAULT_FPS);
  const [fileSizeMb, setFileSizeMb] = React.useState(DEFAULT_FILE_SIZE_MB);
  const [shutterSpeed, setShutterSpeed] = React.useState(DEFAULT_SHUTTER_SPEED_SECONDS);

  const plan = calculateShootPlan({
    mode,
    intervalSeconds,
    durationSeconds: durationMinutes * 60,
    shotCount,
  });

  const videoDurationSeconds = plan
    ? calculateVideoDurationSeconds(plan.shotCount, fps)
    : null;

  const storageGb = plan ? calculateStorageGb(plan.shotCount, fileSizeMb) : null;

  const shutterAngle = plan
    ? calculateShutterAngle(shutterSpeed, plan.intervalSeconds)
    : null;

  const modeLabel = (m: ShootPlanMode) =>
    m === "intervalAndDuration"
      ? t("modeIntervalAndDuration")
      : m === "intervalAndShots"
        ? t("modeIntervalAndShots")
        : t("modeDurationAndShots");

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("shootPlanTitle")}
        </h2>

        <div className="flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("modeLabel")}</span>
            <Select value={mode} onValueChange={(value) => setMode(value as ShootPlanMode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {modeLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {mode !== "durationAndShots" ? (
            <NumberField
              label={t("intervalSeconds")}
              value={intervalSeconds}
              onChange={setIntervalSeconds}
              min={0.1}
              step={0.5}
            />
          ) : (
            <ReadOnlyField
              label={t("intervalSeconds")}
              value={plan ? formatSeconds(plan.intervalSeconds) : "—"}
            />
          )}

          {mode !== "intervalAndShots" ? (
            <NumberField
              label={t("durationMinutes")}
              value={durationMinutes}
              onChange={setDurationMinutes}
              min={1}
              step={1}
            />
          ) : (
            <ReadOnlyField
              label={t("durationMinutes")}
              value={plan ? formatDurationHms(plan.durationSeconds) : "—"}
            />
          )}

          {mode !== "intervalAndDuration" ? (
            <NumberField
              label={t("shotCount")}
              value={shotCount}
              onChange={setShotCount}
              min={1}
              step={1}
            />
          ) : (
            <ReadOnlyField
              label={t("shotCount")}
              value={plan ? String(plan.shotCount) : "—"}
            />
          )}

          {!plan ? (
            <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("outputVideoTitle")}
        </h2>
        <div className="flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("fps")}</span>
            <Select value={String(fps)} onValueChange={(v) => setFps(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FPS_PRESETS.map((f) => (
                  <SelectItem key={f} value={String(f)}>
                    {f} fps
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {plan && videoDurationSeconds !== null ? (
            <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
              <Row label={t("totalShots")} value={String(plan.shotCount)} />
              <Row
                label={t("videoDuration")}
                value={formatDurationHms(videoDurationSeconds)}
                emphasize
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-card p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("advancedTitle")}
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">{t("advancedSubtitle")}</p>

        <div className="flex flex-col gap-5 text-sm">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("storageTitle")}
            </span>
            <NumberField
              label={t("fileSizeMb")}
              value={fileSizeMb}
              onChange={setFileSizeMb}
              min={0.1}
              step={1}
            />
            {plan && storageGb !== null ? (
              <Row label={t("totalStorage")} value={formatGb(storageGb)} emphasize />
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("shutterAngleTitle")}
            </span>
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground">{t("shutterSpeed")}</span>
              <Select
                value={String(shutterSpeed)}
                onValueChange={(v) => setShutterSpeed(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHUTTER_SPEED_STOPS_SECONDS.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {formatShutterSpeed(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            {plan && shutterAngle ? (
              <div className="flex flex-col gap-2">
                <Row
                  label={t("exposureRatio")}
                  value={`${shutterAngle.ratioPercent.toFixed(1)}% (${shutterAngle.angleDegrees.toFixed(0)}°)`}
                  emphasize
                />
                <p className="text-xs text-muted-foreground">
                  {shutterAngle.quality === "choppy"
                    ? t("qualityChoppy")
                    : shutterAngle.quality === "smooth"
                      ? t("qualitySmooth")
                      : t("qualityCinematic")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <Input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
      />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-sm">
        {value}
      </div>
    </label>
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={emphasize ? "text-lg font-semibold text-primary" : "font-medium"}
      >
        {value}
      </span>
    </div>
  );
}
