"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Square, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatShutterSpeed } from "@/lib/exif";
import {
  BASE_SHUTTER_SPEEDS_SECONDS,
  MAX_CUSTOM_STOPS,
  MIN_CUSTOM_STOPS,
  ND_FILTERS,
  calculateExposureSeconds,
  formatCountdownClock,
  formatExposureDuration,
} from "@/lib/nd-calculator";
import { useCountdownTimer } from "@/hooks/use-countdown-timer";
import { useExifStore } from "@/store/exif-store";
import { useNdCalculatorStore } from "@/store/nd-calculator-store";
import { cn } from "@/lib/utils";

export function NdCalculatorCard() {
  const t = useTranslations("Home");

  const exifStatus = useExifStore((s) => s.status);
  const exifData = useExifStore((s) => s.data);

  const baseSeconds = useNdCalculatorStore((s) => s.baseSeconds);
  const filterId = useNdCalculatorStore((s) => s.filterId);
  const customStops = useNdCalculatorStore((s) => s.customStops);
  const setBaseSeconds = useNdCalculatorStore((s) => s.setBaseSeconds);
  const setFilterId = useNdCalculatorStore((s) => s.setFilterId);
  const setCustomStops = useNdCalculatorStore((s) => s.setCustomStops);
  const autoFillFromExif = useNdCalculatorStore((s) => s.autoFillFromExif);

  // Requirement: once EXIF is extracted, feed its shutter speed into the
  // calculator's base speed automatically (only once per uploaded file, so
  // it doesn't fight a manual dropdown change afterwards).
  React.useEffect(() => {
    if (
      exifStatus === "success" &&
      exifData?.shutterSpeedSeconds &&
      exifData.fileName
    ) {
      autoFillFromExif(exifData.fileName, exifData.shutterSpeedSeconds);
    }
  }, [exifStatus, exifData, autoFillFromExif]);

  const baseOptions = React.useMemo(() => {
    const presets = BASE_SHUTTER_SPEEDS_SECONDS;
    const isPreset = presets.some(
      (s) => Math.abs(s - baseSeconds) < 1e-6,
    );
    if (isPreset) return presets;
    // Surface the EXIF-detected value even if it isn't one of the
    // standard full-stop speeds, so it stays selectable/visible.
    return [baseSeconds, ...presets].sort((a, b) => a - b);
  }, [baseSeconds]);

  const selectedFilter =
    ND_FILTERS.find((f) => f.id === filterId) ?? ND_FILTERS[0];
  const stops = selectedFilter.stops ?? customStops;
  const newShutterSeconds = calculateExposureSeconds(baseSeconds, stops);
  const canUseTimer = newShutterSeconds >= 1;

  const { status: timerStatus, remainingSeconds, start, reset } =
    useCountdownTimer(newShutterSeconds);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("ndSectionTitle")}
      </h2>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("baseShutter")}</span>
          <Select
            value={String(baseSeconds)}
            onValueChange={(value) => {
              setBaseSeconds(Number(value));
              reset();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {baseOptions.map((seconds) => (
                <SelectItem key={seconds} value={String(seconds)}>
                  {formatShutterSpeed(seconds)}
                  {exifData?.shutterSpeedSeconds !== undefined &&
                  Math.abs((exifData?.shutterSpeedSeconds ?? NaN) - seconds) <
                    1e-6
                    ? ` (${t("detected")})`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("ndFilter")}</span>
          <Select
            value={filterId}
            onValueChange={(value) => {
              setFilterId(value as typeof filterId);
              reset();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ND_FILTERS.map((filter) => (
                <SelectItem key={filter.id} value={filter.id}>
                  {filter.id === "custom" ? t("customStops") : filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {filterId === "custom" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">
              {t("customStopsLabel")}
            </span>
            <Input
              type="number"
              min={MIN_CUSTOM_STOPS}
              max={MAX_CUSTOM_STOPS}
              value={customStops}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) {
                  setCustomStops(
                    Math.min(MAX_CUSTOM_STOPS, Math.max(MIN_CUSTOM_STOPS, next)),
                  );
                  reset();
                }
              }}
            />
          </label>
        ) : null}

        <div
          className={cn(
            "mt-1 flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
            timerStatus === "done" ? "bg-primary/20" : "bg-primary/10",
          )}
        >
          <span className="text-muted-foreground">{t("newShutter")}</span>
          <span className="text-lg font-semibold text-primary">
            {formatExposureDuration(newShutterSeconds)}
          </span>
        </div>

        {canUseTimer ? (
          <TimerControls
            status={timerStatus}
            remainingSeconds={remainingSeconds}
            onStart={start}
            onReset={reset}
            startLabel={t("startTimer")}
            stopLabel={t("stopTimer")}
            restartLabel={t("restartTimer")}
            doneLabel={t("timerDone")}
          />
        ) : null}
      </div>
    </div>
  );
}

function TimerControls({
  status,
  remainingSeconds,
  onStart,
  onReset,
  startLabel,
  stopLabel,
  restartLabel,
  doneLabel,
}: {
  status: "idle" | "running" | "done";
  remainingSeconds: number;
  onStart: () => void;
  onReset: () => void;
  startLabel: string;
  stopLabel: string;
  restartLabel: string;
  doneLabel: string;
}) {
  if (status === "idle") {
    return (
      <Button className="mt-1" size="sm" onClick={onStart}>
        <Timer className="size-4" />
        {startLabel}
      </Button>
    );
  }

  if (status === "running") {
    return (
      <div className="mt-1 flex items-center gap-2">
        <div className="flex flex-1 items-center justify-center rounded-md border border-border bg-background py-2 font-mono text-lg tabular-nums">
          {formatCountdownClock(remainingSeconds)}
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <Square className="size-4" />
          {stopLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex flex-1 animate-pulse items-center justify-center gap-2 rounded-md border border-primary bg-primary/15 py-2 font-medium text-primary">
        <CheckCircle2 className="size-4" />
        {doneLabel}
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>
        {restartLabel}
      </Button>
    </div>
  );
}
