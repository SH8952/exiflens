"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CUSTOM_PRINT_SIZE_ID,
  DEFAULT_CUSTOM_HEIGHT_IN,
  DEFAULT_CUSTOM_UNIT,
  DEFAULT_CUSTOM_WIDTH_IN,
  DEFAULT_DPI,
  DEFAULT_HEIGHT_PX,
  DEFAULT_PRINT_SIZE_PRESET_ID,
  DEFAULT_WIDTH_PX,
  DPI_PRESETS,
  PRINT_SIZE_PRESETS,
  calculateMaxPrintSize,
  calculateRequiredPixels,
  calculateUpscaleGuidance,
  convertToInches,
  formatLengthCm,
  formatLengthIn,
  formatMegapixels,
  formatPixels,
  formatUpscaleFactor,
  type LengthUnit,
} from "@/lib/print-resolution-calculator";

export function PrintResolutionCalculatorCard() {
  const t = useTranslations("PrintResolutionCalculator");

  const [widthPx, setWidthPx] = React.useState(DEFAULT_WIDTH_PX);
  const [heightPx, setHeightPx] = React.useState(DEFAULT_HEIGHT_PX);
  const [dpi, setDpi] = React.useState(DEFAULT_DPI);

  const [presetId, setPresetId] = React.useState(DEFAULT_PRINT_SIZE_PRESET_ID);
  const [customUnit, setCustomUnit] = React.useState<LengthUnit>(DEFAULT_CUSTOM_UNIT);
  const [customWidth, setCustomWidth] = React.useState(DEFAULT_CUSTOM_WIDTH_IN);
  const [customHeight, setCustomHeight] = React.useState(DEFAULT_CUSTOM_HEIGHT_IN);

  const maxPrintSize = calculateMaxPrintSize(widthPx, heightPx, dpi);

  const preset = PRINT_SIZE_PRESETS.find((p) => p.id === presetId);
  const targetWidthIn =
    presetId === CUSTOM_PRINT_SIZE_ID ? convertToInches(customWidth, customUnit) : preset?.widthIn ?? 0;
  const targetHeightIn =
    presetId === CUSTOM_PRINT_SIZE_ID ? convertToInches(customHeight, customUnit) : preset?.heightIn ?? 0;

  const requiredPixels = calculateRequiredPixels(targetWidthIn, targetHeightIn, dpi);
  const isSufficient =
    requiredPixels !== null && widthPx * heightPx >= requiredPixels.widthPx * requiredPixels.heightPx;
  const upscale = requiredPixels
    ? calculateUpscaleGuidance(widthPx, heightPx, requiredPixels.widthPx, requiredPixels.heightPx)
    : null;

  const photoPresets = PRINT_SIZE_PRESETS.filter((p) => p.category === "photo");
  const paperPresets = PRINT_SIZE_PRESETS.filter((p) => p.category === "paper");

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>

      <div className="flex flex-col gap-3 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("photoSizeTitle")}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("widthPx")}</span>
            <Input
              type="number"
              min={1}
              value={widthPx}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setWidthPx(next);
              }}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("heightPx")}</span>
            <Input
              type="number"
              min={1}
              value={heightPx}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setHeightPx(next);
              }}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("dpiLabel")}</span>
          <Select value={String(dpi)} onValueChange={(value) => setDpi(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DPI_PRESETS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {t("dpiOption", { dpi: d })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {maxPrintSize ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <Row
              label={t("maxPrintSizeLabel")}
              value={`${formatLengthIn(maxPrintSize.widthIn)} × ${formatLengthIn(maxPrintSize.heightIn)}`}
              emphasize
            />
            <Row
              label={t("maxPrintSizeCmLabel")}
              value={`${formatLengthCm(maxPrintSize.widthCm)} × ${formatLengthCm(maxPrintSize.heightCm)}`}
            />
            <Row label={t("megapixelsLabel")} value={formatMegapixels((widthPx * heightPx) / 1_000_000)} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}

        <h3 className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("targetSizeTitle")}
        </h3>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("targetSizeLabel")}</span>
          <Select value={presetId} onValueChange={setPresetId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t("photoGroupLabel")}</SelectLabel>
                {photoPresets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>{t("paperGroupLabel")}</SelectLabel>
                {paperPresets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectItem value={CUSTOM_PRINT_SIZE_ID}>{t("customOption")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>

        {presetId === CUSTOM_PRINT_SIZE_ID ? (
          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-1 flex flex-col gap-1.5">
              <span className="text-muted-foreground">{t("unitLabel")}</span>
              <Select value={customUnit} onValueChange={(value) => setCustomUnit(value as LengthUnit)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">{t("unitIn")}</SelectItem>
                  <SelectItem value="cm">{t("unitCm")}</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground">{t("customWidth")}</span>
              <Input
                type="number"
                min={0.1}
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
                min={0.1}
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

        {requiredPixels ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg border border-border px-3 py-3">
            <Row label={t("requiredPixelsLabel")} value={`${formatPixels(requiredPixels.widthPx)} × ${formatPixels(requiredPixels.heightPx)}`} />
            <Row label={t("requiredMegapixelsLabel")} value={formatMegapixels(requiredPixels.megapixels)} />
            <p className={isSufficient ? "text-sm font-semibold text-primary" : "text-sm font-semibold text-destructive"}>
              {isSufficient ? t("verdictSufficient") : t("verdictInsufficient")}
            </p>
          </div>
        ) : null}

        {requiredPixels && upscale ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg border border-border px-3 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("advancedTitle")}
            </h3>
            <Row label={t("upscaleFactorLabel")} value={formatUpscaleFactor(upscale.upscaleFactor)} />
            <p className="text-xs text-muted-foreground">
              {upscale.category === "sufficient"
                ? t("upscaleSufficient")
                : upscale.category === "minor"
                  ? t("upscaleMinor")
                  : upscale.category === "moderate"
                    ? t("upscaleModerate")
                    : t("upscaleMajor")}
            </p>
          </div>
        ) : null}
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
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasize ? "text-lg font-semibold text-primary" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
