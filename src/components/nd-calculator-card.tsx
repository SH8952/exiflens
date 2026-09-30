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
import { useRouter, usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/seo";
import { ShareButton } from "@/components/share-button";

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

  const router = useRouter();
  const pathname = usePathname();
  const hydratedFromUrl = React.useRef(false);

  // One-time hydration from the URL on first mount, so a shared link
  // ("share this exact result") reproduces the same calculator state for
  // whoever opens it. Reads window.location directly (rather than
  // useSearchParams) so this stays a plain client-only effect and the
  // home page keeps being statically generated.
  React.useEffect(() => {
    if (hydratedFromUrl.current) return;
    hydratedFromUrl.current = true;

    const params = new URLSearchParams(window.location.search);

    const paramBase = params.get("nd_b");
    if (paramBase) {
      const seconds = Number(paramBase);
      if (Number.isFinite(seconds) && seconds > 0) setBaseSeconds(seconds);
    }

    const paramFilter = params.get("nd_f");
    if (paramFilter && ND_FILTERS.some((filter) => filter.id === paramFilter)) {
      setFilterId(paramFilter as typeof filterId);
    }

    const paramCustom = params.get("nd_c");
    if (paramCustom) {
      const stopsValue = Number(paramCustom);
      if (Number.isFinite(stopsValue)) {
        setCustomStops(
          Math.min(MAX_CUSTOM_STOPS, Math.max(MIN_CUSTOM_STOPS, stopsValue)),
        );
      }
    }
    // Intentionally runs once on mount only — see hydratedFromUrl guard above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync with the calculator inputs (debounced) so the
  // share button always points at a link that reproduces this exact
  // result. Uses replace (not push) so adjusting a dropdown doesn't spam
  // the browser back-button history.
  React.useEffect(() => {
    const params = new URLSearchParams();
    params.set("nd_b", String(baseSeconds));
    params.set("nd_f", filterId);
    if (filterId === "custom") params.set("nd_c", String(customStops));

    const id = window.setTimeout(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 500);
    return () => window.clearTimeout(id);
  }, [baseSeconds, filterId, customStops, pathname, router]);

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

  const shareUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set("nd_b", String(baseSeconds));
    params.set("nd_f", filterId);
    if (filterId === "custom") params.set("nd_c", String(customStops));
    return `${SITE_URL}${pathname}?${params.toString()}`;
  }, [baseSeconds, filterId, customStops, pathname]);

  const shareText = `${formatShutterSpeed(baseSeconds)} \u2192 ${formatExposureDuration(newShutterSeconds)} (${selectedFilter.label})`;

  const { status: timerStatus, remainingSeconds, start, reset } =
    useCountdownTimer(newShutterSeconds);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("ndSectionTitle")}
        </h2>
        <ShareButton title={t("ndSectionTitle")} text={shareText} url={shareUrl} />
      </div>
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
