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
  DEFAULT_APERTURE,
  DEFAULT_COMPARE_SENSOR_ID,
  DEFAULT_CUSTOM_HEIGHT_MM,
  DEFAULT_CUSTOM_WIDTH_MM,
  DEFAULT_FOCAL_LENGTH_MM,
  DEFAULT_SENSOR_ID,
  DEFAULT_SUBJECT_DISTANCE_M,
  SENSOR_PRESETS,
  calculateCircleOfConfusionMm,
  calculateComparableFocalLengthMm,
  calculateCropFactor,
  calculateEquivalentAperture,
  calculateEquivalentFocalLengthMm,
  calculateFovDegrees,
  formatAperture,
  formatCropFactor,
  formatFocalLengthMm,
  formatFovDegrees,
  type SensorPresetId,
} from "@/lib/crop-factor-calculator";
import { calculateDof, formatDistanceMeters } from "@/lib/dof-calculator";

export function CropFactorCalculatorCard() {
  const t = useTranslations("CropFactorCalculator");

  const [sensorId, setSensorId] = React.useState<SensorPresetId>(DEFAULT_SENSOR_ID);
  const [customWidth, setCustomWidth] = React.useState(DEFAULT_CUSTOM_WIDTH_MM);
  const [customHeight, setCustomHeight] = React.useState(DEFAULT_CUSTOM_HEIGHT_MM);
  const [focalLength, setFocalLength] = React.useState(DEFAULT_FOCAL_LENGTH_MM);

  const [compareSensorId, setCompareSensorId] = React.useState<SensorPresetId>(DEFAULT_COMPARE_SENSOR_ID);
  const [aperture, setAperture] = React.useState(DEFAULT_APERTURE);
  const [subjectDistanceM, setSubjectDistanceM] = React.useState(DEFAULT_SUBJECT_DISTANCE_M);

  const sensorPreset = SENSOR_PRESETS.find((s) => s.id === sensorId) ?? SENSOR_PRESETS[0];
  const sensorWidthMm = sensorPreset.widthMm ?? customWidth;
  const sensorHeightMm = sensorPreset.heightMm ?? customHeight;

  const compareSensorPreset =
    SENSOR_PRESETS.find((s) => s.id === compareSensorId) ?? SENSOR_PRESETS[0];
  // Compare sensor never uses the "custom" values above — if the user picks
  // "Custom" for the comparison target too, fall back to full-frame so the
  // comparison stays meaningful without a second pair of dimension inputs.
  const compareWidthMm = compareSensorPreset.widthMm ?? 36;
  const compareHeightMm = compareSensorPreset.heightMm ?? 24;

  const cropFactor = calculateCropFactor(sensorWidthMm, sensorHeightMm);
  const equivalentFocalLength =
    cropFactor !== null ? calculateEquivalentFocalLengthMm(focalLength, cropFactor) : null;
  const horizontalFov = calculateFovDegrees(sensorWidthMm, focalLength);
  const verticalFov = calculateFovDegrees(sensorHeightMm, focalLength);

  const compareCropFactor = calculateCropFactor(compareWidthMm, compareHeightMm);
  const comparableFocalLength =
    equivalentFocalLength !== null && compareCropFactor !== null
      ? calculateComparableFocalLengthMm(equivalentFocalLength, compareCropFactor)
      : null;

  const equivalentAperture =
    cropFactor !== null && compareCropFactor !== null
      ? calculateEquivalentAperture(aperture, cropFactor, compareCropFactor)
      : null;

  const sensorCocMm = calculateCircleOfConfusionMm(sensorWidthMm, sensorHeightMm);
  const dofResult =
    sensorCocMm !== null
      ? calculateDof(focalLength, aperture, sensorCocMm, subjectDistanceM)
      : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("sensorLabel")}</span>
          <Select value={sensorId} onValueChange={(value) => setSensorId(value as SensorPresetId)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SENSOR_PRESETS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.id === "custom" ? t("customOption") : s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {sensorPreset.id === "custom" ? (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground">{t("customWidth")}</span>
              <Input
                type="number"
                min={1}
                step={0.1}
                value={customWidth}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) setCustomWidth(next);
                }}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground">{t("customHeight")}</span>
              <Input
                type="number"
                min={1}
                step={0.1}
                value={customHeight}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) setCustomHeight(next);
                }}
              />
            </label>
          </div>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("focalLengthLabel")}</span>
          <Input
            type="number"
            min={1}
            max={2000}
            value={focalLength}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) setFocalLength(next);
            }}
          />
        </label>

        {cropFactor !== null && equivalentFocalLength !== null && horizontalFov !== null && verticalFov !== null ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <Row label={t("cropFactorLabel")} value={formatCropFactor(cropFactor)} />
            <Row
              label={t("equivalentFocalLengthLabel")}
              value={formatFocalLengthMm(equivalentFocalLength)}
              emphasize
            />
            <Row label={t("horizontalFovLabel")} value={formatFovDegrees(horizontalFov)} />
            <Row label={t("verticalFovLabel")} value={formatFovDegrees(verticalFov)} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}

        <div className="mt-1 flex flex-col gap-3 rounded-lg border border-border px-3 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("advancedTitle")}
          </h3>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("compareSensorLabel")}</span>
            <Select
              value={compareSensorId}
              onValueChange={(value) => setCompareSensorId(value as SensorPresetId)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SENSOR_PRESETS.filter((s) => s.id !== "custom").map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{t("compareSensorHint")}</span>
          </label>

          {comparableFocalLength !== null ? (
            <Row
              label={t("comparableFocalLengthLabel", { sensor: compareSensorPreset.label })}
              value={formatFocalLengthMm(comparableFocalLength)}
              emphasize
            />
          ) : null}

          <div className="mt-1 border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium text-foreground">{t("dofDiagnosisTitle")}</p>
            <p className="mb-2 text-xs text-muted-foreground">{t("dofDiagnosisHint")}</p>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-muted-foreground">{t("apertureLabel")}</span>
                <Input
                  type="number"
                  min={0.5}
                  step={0.1}
                  value={aperture}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isFinite(next)) setAperture(next);
                  }}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-muted-foreground">{t("subjectDistanceLabel")}</span>
                <Input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={subjectDistanceM}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isFinite(next)) setSubjectDistanceM(next);
                  }}
                />
              </label>
            </div>

            {dofResult ? (
              <div className="mt-3 flex flex-col gap-2">
                <Row label={t("hyperfocalLabel")} value={formatDistanceMeters(dofResult.hyperfocalMeters)} />
                <Row label={t("nearLimitLabel")} value={formatDistanceMeters(dofResult.nearLimitMeters)} />
                <Row
                  label={t("farLimitLabel")}
                  value={
                    dofResult.farLimitMeters !== null
                      ? formatDistanceMeters(dofResult.farLimitMeters)
                      : t("infinity")
                  }
                />
                <Row
                  label={t("totalDofLabel")}
                  value={
                    dofResult.totalDofMeters !== null
                      ? formatDistanceMeters(dofResult.totalDofMeters)
                      : t("infinity")
                  }
                  emphasize
                />
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">{t("invalidInput")}</p>
            )}

            {equivalentAperture !== null ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("equivalentApertureNote", {
                  sensor: compareSensorPreset.label,
                  aperture: formatAperture(equivalentAperture),
                })}
              </p>
            ) : null}
          </div>
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasize ? "text-lg font-semibold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
