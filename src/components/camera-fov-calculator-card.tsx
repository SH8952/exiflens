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
  DEFAULT_CUSTOM_HEIGHT_MM,
  DEFAULT_CUSTOM_WIDTH_MM,
  DEFAULT_FOCAL_LENGTH_MM,
  DEFAULT_SENSOR_ID,
  SENSOR_PRESETS,
  calculateDiagonalMm,
  calculateFovDegrees,
  formatFovDegrees,
  type SensorPresetId,
} from "@/lib/crop-factor-calculator";

/**
 * Common prime/zoom focal lengths shown in the comparison table, matching
 * the same "reuse the single-value formula across a preset list" pattern
 * already used by the DoF/Hyperfocal table page. No new FOV math here —
 * calculateFovDegrees() is the same function the crop-factor calculator
 * already uses for its horizontal/vertical FOV display.
 */
const TABLE_FOCAL_LENGTHS_MM = [14, 20, 24, 35, 50, 85, 105, 135, 200, 300];

export function CameraFovCalculatorCard() {
  const t = useTranslations("CameraFovCalculator");

  const [sensorId, setSensorId] = React.useState<SensorPresetId>(DEFAULT_SENSOR_ID);
  const [customWidth, setCustomWidth] = React.useState(DEFAULT_CUSTOM_WIDTH_MM);
  const [customHeight, setCustomHeight] = React.useState(DEFAULT_CUSTOM_HEIGHT_MM);
  const [focalLength, setFocalLength] = React.useState(DEFAULT_FOCAL_LENGTH_MM);

  const sensorPreset = SENSOR_PRESETS.find((s) => s.id === sensorId) ?? SENSOR_PRESETS[0];
  const sensorWidthMm = sensorPreset.widthMm ?? customWidth;
  const sensorHeightMm = sensorPreset.heightMm ?? customHeight;
  const diagonalMm = calculateDiagonalMm(sensorWidthMm, sensorHeightMm);

  const horizontalFov = calculateFovDegrees(sensorWidthMm, focalLength);
  const verticalFov = calculateFovDegrees(sensorHeightMm, focalLength);
  const diagonalFov =
    diagonalMm !== null ? calculateFovDegrees(diagonalMm, focalLength) : null;

  const tableRows = TABLE_FOCAL_LENGTHS_MM.map((mm) => ({
    focalLength: mm,
    horizontal: calculateFovDegrees(sensorWidthMm, mm),
    vertical: calculateFovDegrees(sensorHeightMm, mm),
    diagonal: diagonalMm !== null ? calculateFovDegrees(diagonalMm, mm) : null,
  }));

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

        {horizontalFov !== null && verticalFov !== null && diagonalFov !== null ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <Row label={t("horizontalFovLabel")} value={formatFovDegrees(horizontalFov)} />
            <Row label={t("verticalFovLabel")} value={formatFovDegrees(verticalFov)} />
            <Row label={t("diagonalFovLabel")} value={formatFovDegrees(diagonalFov)} emphasize />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("tableTitle")}</h3>
        <p className="text-xs text-muted-foreground">{t("tableSubtitle")}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-1.5 pr-3">{t("focalLengthLabel")}</th>
                <th className="py-1.5 pr-3">{t("horizontalFovLabel")}</th>
                <th className="py-1.5 pr-3">{t("verticalFovLabel")}</th>
                <th className="py-1.5">{t("diagonalFovLabel")}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr
                  key={row.focalLength}
                  className={
                    row.focalLength === focalLength
                      ? "bg-primary/10 font-medium"
                      : "border-b border-border/60"
                  }
                >
                  <td className="py-1.5 pr-3">{row.focalLength}mm</td>
                  <td className="py-1.5 pr-3">
                    {row.horizontal !== null ? formatFovDegrees(row.horizontal) : "—"}
                  </td>
                  <td className="py-1.5 pr-3">
                    {row.vertical !== null ? formatFovDegrees(row.vertical) : "—"}
                  </td>
                  <td className="py-1.5">
                    {row.diagonal !== null ? formatFovDegrees(row.diagonal) : "—"}
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
