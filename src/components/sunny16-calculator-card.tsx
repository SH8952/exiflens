"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APERTURE_STOPS,
  ISO_STOPS,
  calculateExposureCompensation,
  formatAperture,
  formatIso,
  formatShutterSpeed,
} from "@/lib/exposure-calculator";

type LightingConditionId =
  | "sunnyBright"
  | "slightOvercast"
  | "overcast"
  | "heavyOvercast"
  | "openShade";

type LightingCondition = {
  id: LightingConditionId;
  /** Baseline f-number for the classic "Sunny f/16 rule" family, at ISO 100. */
  baseAperture: number;
};

/**
 * The "Sunny 16 rule" and its widely-used variants: at each lighting
 * condition's baseline aperture, shutter speed ≈ 1/ISO (in seconds) gives
 * a correct exposure. This is standard, decades-old photographic
 * convention (not specific to any one calculator or app) — see the
 * companion guide article for the reasoning.
 */
export const LIGHTING_CONDITIONS: LightingCondition[] = [
  { id: "sunnyBright", baseAperture: 16 },
  { id: "slightOvercast", baseAperture: 11 },
  { id: "overcast", baseAperture: 8 },
  { id: "heavyOvercast", baseAperture: 5.6 },
  { id: "openShade", baseAperture: 4 },
];

const BASELINE_ISO = 100;
const BASELINE_SHUTTER_SECONDS = 1 / 100;

export function Sunny16CalculatorCard() {
  const t = useTranslations("Sunny16Calculator");

  const [conditionId, setConditionId] =
    React.useState<LightingConditionId>("sunnyBright");
  const [iso, setIso] = React.useState(100);
  const [aperture, setAperture] = React.useState(16);

  const condition =
    LIGHTING_CONDITIONS.find((c) => c.id === conditionId) ??
    LIGHTING_CONDITIONS[0];

  // Two sequential stop-conversions, reusing calculateExposureCompensation
  // from exposure-calculator.ts exactly as-is (no new exposure math):
  // 1) hold ISO at the rule's baseline (100) and solve the shutter speed
  //    for the user's chosen aperture;
  // 2) hold that aperture fixed and solve the shutter speed again for the
  //    user's chosen ISO. Because stops are additive/log-linear, doing
  //    this in two steps gives the same result as solving all three at
  //    once would.
  const step1 = calculateExposureCompensation({
    baseline: {
      aperture: condition.baseAperture,
      shutterSpeedSeconds: BASELINE_SHUTTER_SECONDS,
      iso: BASELINE_ISO,
    },
    changedParam: "aperture",
    newValue: aperture,
    compensateParam: "shutterSpeed",
  });

  const step2 =
    step1 &&
    calculateExposureCompensation({
      baseline: {
        aperture,
        shutterSpeedSeconds: step1.compensateValue,
        iso: BASELINE_ISO,
      },
      changedParam: "iso",
      newValue: iso,
      compensateParam: "shutterSpeed",
    });

  const shutterSeconds = step2?.compensateValue ?? null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("lightingCondition")}</span>
          <Select
            value={conditionId}
            onValueChange={(value) => {
              const next = value as LightingConditionId;
              setConditionId(next);
              const nextCondition = LIGHTING_CONDITIONS.find(
                (c) => c.id === next,
              );
              if (nextCondition) setAperture(nextCondition.baseAperture);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIGHTING_CONDITIONS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {t(`conditions.${c.id}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("iso")}</span>
          <Select
            value={String(iso)}
            onValueChange={(value) => setIso(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ISO_STOPS.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {formatIso(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("aperture")}</span>
          <Select
            value={String(aperture)}
            onValueChange={(value) => setAperture(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APERTURE_STOPS.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {formatAperture(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {shutterSeconds !== null ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("recommendedShutter")}</span>
              <span className="text-lg font-semibold text-primary">
                {formatShutterSpeed(shutterSeconds)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("baselineNote", {
                aperture: formatAperture(condition.baseAperture),
              })}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}
      </div>
    </div>
  );
}
