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
  ASTRO_SENSOR_PRESETS,
  DEFAULT_APERTURE,
  DEFAULT_FOCAL_LENGTH_MM,
  DEFAULT_MEGAPIXEL_ID,
  DEFAULT_SENSOR_ID,
  MEGAPIXEL_PRESETS,
  calculate500Rule,
  calculateHorizontalPixels,
  calculateNpfRule,
  calculatePixelPitchMicrons,
  formatExposureSeconds,
  type AstroSensorPresetId,
  type MegapixelPresetId,
} from "@/lib/astro-calculator";

export function AstroCalculatorCard() {
  const t = useTranslations("AstroCalculator");

  const [focalLength, setFocalLength] = React.useState(DEFAULT_FOCAL_LENGTH_MM);
  const [aperture, setAperture] = React.useState(DEFAULT_APERTURE);
  const [sensorId, setSensorId] = React.useState<AstroSensorPresetId>(DEFAULT_SENSOR_ID);
  const [megapixelId, setMegapixelId] = React.useState<MegapixelPresetId>(DEFAULT_MEGAPIXEL_ID);

  const sensor = ASTRO_SENSOR_PRESETS.find((s) => s.id === sensorId) ?? ASTRO_SENSOR_PRESETS[0];
  const megapixelPreset = MEGAPIXEL_PRESETS.find((m) => m.id === megapixelId) ?? MEGAPIXEL_PRESETS[0];

  const horizontalPixels = calculateHorizontalPixels(megapixelPreset.megapixels, sensor.aspectRatio);
  const pixelPitchMicrons = calculatePixelPitchMicrons(sensor.sensorWidthMm, horizontalPixels);

  const rule500Seconds = calculate500Rule(focalLength, sensor.cropFactor);
  const npfSeconds = calculateNpfRule(focalLength, aperture, pixelPitchMicrons);

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
          <span className="text-muted-foreground">{t("aperture")}</span>
          <Select value={String(aperture)} onValueChange={(value) => setAperture(Number(value))}>
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
          <span className="text-muted-foreground">{t("sensor")}</span>
          <Select value={sensorId} onValueChange={(value) => setSensorId(value as AstroSensorPresetId)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASTRO_SENSOR_PRESETS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("megapixels")}</span>
          <Select
            value={megapixelId}
            onValueChange={(value) => setMegapixelId(value as MegapixelPresetId)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEGAPIXEL_PRESETS.map((m) => {
                const mpRounded = Math.round(m.megapixels);
                return (
                  <SelectItem key={m.id} value={m.id}>
                    {t("megapixelOption", {
                      mp: mpRounded,
                      man: (mpRounded * 100).toLocaleString(),
                      models: m.exampleModels,
                    })}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </label>

        {rule500Seconds !== null && npfSeconds !== null ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <Row label={t("rule500")} value={formatExposureSeconds(rule500Seconds)} />
            <Row label={t("ruleNpf")} value={formatExposureSeconds(npfSeconds)} emphasize />
            <p className="text-xs text-muted-foreground">
              {npfSeconds < rule500Seconds ? t("npfStricterNote") : t("npfLooserNote")}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}
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
      <span
        className={emphasize ? "text-lg font-semibold text-primary" : "font-medium"}
      >
        {value}
      </span>
    </div>
  );
}
