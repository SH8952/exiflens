"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculateGoldenBlueHour,
  isValidLatitude,
  isValidLongitude,
  type GoldenBlueHourTimes,
} from "@/lib/golden-hour";

type LocationStatus = "idle" | "locating" | "granted" | "denied" | "unsupported";

function todayDateInputValue(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatTime(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GoldenHourCalculatorCard() {
  const t = useTranslations("GoldenHourCalculator");

  const [dateInput, setDateInput] = React.useState(todayDateInputValue());
  const [latInput, setLatInput] = React.useState("");
  const [lngInput, setLngInput] = React.useState("");
  const [locationStatus, setLocationStatus] =
    React.useState<LocationStatus>("idle");

  const handleUseMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }
    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatInput(position.coords.latitude.toFixed(4));
        setLngInput(position.coords.longitude.toFixed(4));
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  const lat = Number(latInput);
  const lng = Number(lngInput);
  const hasValidLocation =
    latInput.trim() !== "" &&
    lngInput.trim() !== "" &&
    isValidLatitude(lat) &&
    isValidLongitude(lng);

  let result: GoldenBlueHourTimes | null = null;
  if (hasValidLocation && dateInput) {
    // Parsed as local midnight; SunCalc anchors to that date's solar day
    // regardless of the time-of-day component, so this is safe.
    const parsedDate = new Date(`${dateInput}T12:00:00`);
    if (!Number.isNaN(parsedDate.getTime())) {
      result = calculateGoldenBlueHour(parsedDate, lat, lng);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>

      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("dateLabel")}</span>
          <Input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("locationLabel")}</span>
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="decimal"
              placeholder={t("latitudePlaceholder")}
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              aria-label={t("latitudePlaceholder")}
            />
            <Input
              type="number"
              inputMode="decimal"
              placeholder={t("longitudePlaceholder")}
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              aria-label={t("longitudePlaceholder")}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={handleUseMyLocation}
            disabled={locationStatus === "locating"}
          >
            {locationStatus === "locating" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LocateFixed className="size-4" />
            )}
            {t("useMyLocation")}
          </Button>
          {locationStatus === "denied" ? (
            <p className="text-xs text-destructive">{t("locationDenied")}</p>
          ) : null}
          {locationStatus === "unsupported" ? (
            <p className="text-xs text-destructive">
              {t("locationUnsupported")}
            </p>
          ) : null}
        </div>

        {!hasValidLocation ? (
          <p className="text-xs text-muted-foreground">
            {t("enterLocationPrompt")}
          </p>
        ) : result ? (
          result.alwaysUp || result.alwaysDown ? (
            <p className="mt-1 rounded-lg bg-primary/10 px-3 py-3 text-sm text-muted-foreground">
              {result.alwaysUp ? t("polarDayNote") : t("polarNightNote")}
            </p>
          ) : (
            <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("morningBlueHour")}
                </span>
                <span className="font-medium">
                  {formatTime(result.morningBlueHourStart)} –{" "}
                  {formatTime(result.morningBlueHourEnd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("morningGoldenHour")}
                </span>
                <span className="font-medium">
                  {formatTime(result.morningGoldenHourStart)} –{" "}
                  {formatTime(result.morningGoldenHourEnd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("eveningGoldenHour")}
                </span>
                <span className="font-medium">
                  {formatTime(result.eveningGoldenHourStart)} –{" "}
                  {formatTime(result.eveningGoldenHourEnd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("eveningBlueHour")}
                </span>
                <span className="font-medium">
                  {formatTime(result.eveningBlueHourStart)} –{" "}
                  {formatTime(result.eveningBlueHourEnd)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("timezoneNote")}
              </p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
