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
  MAX_CUSTOM_COC_MM,
  MIN_CUSTOM_COC_MM,
  SENSOR_PRESETS,
  calculateDof,
  formatDistanceMeters,
  type SensorPresetId,
} from "@/lib/dof-calculator";

/**
 * Fixed subject-distance rows for the DoF table, matching the "table"
 * search intent (a page listing every value at once) rather than the
 * single-value /tools/dof-calculator. Reuses calculateDof() as-is — no
 * new depth-of-field math, just iterating it over a preset list of
 * distances and apertures instead of one manual input each.
 */
const TABLE_SUBJECT_DISTANCES_M = [0.5, 1, 2, 3, 5, 10, 20, 50, 100];

export function DofHyperfocalTableCard() {
  const t = useTranslations("DofHyperfocalTable");

  const [focalLength, setFocalLength] = React.useState(
    DEFAULT_FOCAL_LENGTH_MM,
  );
  const [aperture, setAperture] = React.useState(DEFAULT_APERTURE);
  const [sensorId, setSensorId] = React.useState<SensorPresetId>("full-frame");
  const [customCoc, setCustomCoc] = React.useState(0.03);

  const sensor =
    SENSOR_PRESETS.find((s) => s.id === sensorId) ?? SENSOR_PRESETS[0];
  const coc = sensor.circleOfConfusionMm ?? customCoc;

  // Hyperfocal distance depends only on focal length, aperture, and CoC —
  // not on subject distance — so any positive placeholder distance works
  // here purely to satisfy calculateDof()'s signature.
  const hyperfocalRows = APERTURE_PRESETS.map((f) => ({
    aperture: f,
    result: calculateDof(focalLength, f, coc, 1),
  }));

  const dofRows = TABLE_SUBJECT_DISTANCES_M.map((distance) => ({
    distance,
    result: calculateDof(focalLength, aperture, coc, distance),
  }));

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
            <span className="text-muted-foreground">
              {t("customCocLabel")}
            </span>
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
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("hyperfocalTableTitle")}</h3>
        <p className="text-xs text-muted-foreground">
          {t("hyperfocalTableSubtitle")}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-1.5 pr-3">{t("aperture")}</th>
                <th className="py-1.5">{t("hyperfocal")}</th>
              </tr>
            </thead>
            <tbody>
              {hyperfocalRows.map((row) => (
                <tr
                  key={row.aperture}
                  className={
                    row.aperture === aperture
                      ? "bg-primary/10 font-medium"
                      : "border-b border-border/60"
                  }
                >
                  <td className="py-1.5 pr-3">f/{row.aperture}</td>
                  <td className="py-1.5">
                    {row.result
                      ? formatDistanceMeters(row.result.hyperfocalMeters)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("dofTableTitle")}</h3>
        <p className="text-xs text-muted-foreground">{t("dofTableSubtitle")}</p>

        <label className="flex max-w-xs flex-col gap-1.5 text-sm">
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-1.5 pr-3">{t("subjectDistance")}</th>
                <th className="py-1.5 pr-3">{t("nearLimit")}</th>
                <th className="py-1.5 pr-3">{t("farLimit")}</th>
                <th className="py-1.5">{t("totalDof")}</th>
              </tr>
            </thead>
            <tbody>
              {dofRows.map((row) => (
                <tr key={row.distance} className="border-b border-border/60">
                  <td className="py-1.5 pr-3">
                    {formatDistanceMeters(row.distance)}
                  </td>
                  <td className="py-1.5 pr-3">
                    {row.result
                      ? formatDistanceMeters(row.result.nearLimitMeters)
                      : "—"}
                  </td>
                  <td className="py-1.5 pr-3">
                    {row.result
                      ? row.result.farLimitMeters === null
                        ? t("infinity")
                        : formatDistanceMeters(row.result.farLimitMeters)
                      : "—"}
                  </td>
                  <td className="py-1.5">
                    {row.result
                      ? row.result.totalDofMeters === null
                        ? t("infinity")
                        : formatDistanceMeters(row.result.totalDofMeters)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
