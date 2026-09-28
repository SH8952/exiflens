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
  APERTURE_PRESETS,
  DEFAULT_APERTURE,
  DEFAULT_FOCAL_LENGTH_MM,
  DEFAULT_SUBJECT_DISTANCE_M,
  MAX_CUSTOM_COC_MM,
  MIN_CUSTOM_COC_MM,
  SENSOR_PRESETS,
  calculateDiffraction,
  calculateDof,
  formatAperture,
  formatDistanceMeters,
  formatMicrons,
  type SensorPresetId,
} from "@/lib/dof-calculator";

export function AdvancedDofDiffractionCard() {
  const t = useTranslations("AdvancedDofDiffractionCalculator");

  const [focalLength, setFocalLength] = React.useState(DEFAULT_FOCAL_LENGTH_MM);
  const [aperture, setAperture] = React.useState(DEFAULT_APERTURE);
  const [subjectDistance, setSubjectDistance] = React.useState(
    DEFAULT_SUBJECT_DISTANCE_M,
  );
  const [sensorId, setSensorId] = React.useState<SensorPresetId>("full-frame");
  const [customCoc, setCustomCoc] = React.useState(0.03);

  const sensor =
    SENSOR_PRESETS.find((s) => s.id === sensorId) ?? SENSOR_PRESETS[0];
  const coc = sensor.circleOfConfusionMm ?? customCoc;

  const dof = calculateDof(focalLength, aperture, coc, subjectDistance);
  const diffraction = calculateDiffraction(aperture, coc);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("focalLength")}</span>
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

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("sensor")}</span>
          <Select
            value={sensorId}
            onValueChange={(value) => setSensorId(value as SensorPresetId)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SENSOR_PRESETS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.id === "custom" ? t("customSensor") : s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {sensorId === "custom" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("customCocLabel")}</span>
            <Input
              type="number"
              step={0.001}
              min={MIN_CUSTOM_COC_MM}
              max={MAX_CUSTOM_COC_MM}
              value={customCoc}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) {
                  setCustomCoc(
                    Math.min(MAX_CUSTOM_COC_MM, Math.max(MIN_CUSTOM_COC_MM, next)),
                  );
                }
              }}
            />
          </label>
        ) : null}

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
              {APERTURE_PRESETS.map((f) => (
                <SelectItem key={f} value={String(f)}>
                  f/{f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("subjectDistance")}</span>
          <Input
            type="number"
            step={0.1}
            min={0.01}
            value={subjectDistance}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) setSubjectDistance(next);
            }}
          />
        </label>
      </div>

      {diffraction ? (
        <div className="mt-5 flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("diffractionTitle")}</h3>
          <div className="flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("diffractionLimitedAperture")}
              </span>
              <span className="font-semibold text-primary">
                {formatAperture(diffraction.diffractionLimitedAperture)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("airyDiskDiameter")}</span>
              <span className="font-medium">
                {formatMicrons(diffraction.airyDiskDiameterMm)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {diffraction.isDiffractionLimited
                ? t("diffractionWarning", {
                    aperture: formatAperture(aperture),
                  })
                : t("diffractionOk", { aperture: formatAperture(aperture) })}
            </p>
          </div>
        </div>
      ) : null}

      {dof ? (
        <div className="mt-5 flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("dofTitle")}</h3>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between border-b border-border/60 py-1.5">
              <span className="text-muted-foreground">{t("hyperfocal")}</span>
              <span>{formatDistanceMeters(dof.hyperfocalMeters)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 py-1.5">
              <span className="text-muted-foreground">{t("nearLimit")}</span>
              <span>{formatDistanceMeters(dof.nearLimitMeters)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 py-1.5">
              <span className="text-muted-foreground">{t("farLimit")}</span>
              <span>
                {dof.farLimitMeters === null
                  ? t("infinity")
                  : formatDistanceMeters(dof.farLimitMeters)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">{t("totalDof")}</span>
              <span>
                {dof.totalDofMeters === null
                  ? t("infinity")
                  : formatDistanceMeters(dof.totalDofMeters)}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
