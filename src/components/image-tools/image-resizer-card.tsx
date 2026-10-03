"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BatchWorkbench, type ProcessResult } from "./batch-workbench";
import {
  CheckField,
  NumberField,
  RadioGroupField,
  RangeField,
  SelectField,
} from "./fields";
import {
  buildOutputName,
  canvasToBlob,
  carryJpegExif,
  drawScaled,
  loadImage,
  sniffMime,
  type OutputMime,
} from "@/lib/image-ops";

type Mode = "percent" | "fit" | "exact";
type Format = "auto" | "jpeg" | "webp" | "png";

const PRESETS: { id: string; w: number; h: number }[] = [
  { id: "blog800", w: 800, h: 0 },
  { id: "blog1200", w: 1200, h: 0 },
  { id: "hd", w: 1280, h: 720 },
  { id: "fhd", w: 1920, h: 1080 },
  { id: "insta", w: 1080, h: 1350 },
  { id: "square", w: 1080, h: 1080 },
  { id: "profile", w: 400, h: 400 },
  { id: "a4", w: 2480, h: 3508 },
];

export function ImageResizerCard() {
  const t = useTranslations("ImageResizer");
  const [mode, setMode] = React.useState<Mode>("fit");
  const [percent, setPercent] = React.useState(50);
  const [width, setWidth] = React.useState(1200);
  const [height, setHeight] = React.useState(0);
  const [allowUpscale, setAllowUpscale] = React.useState(false);
  const [format, setFormat] = React.useState<Format>("auto");
  const [quality, setQuality] = React.useState(90);
  const [keepExif, setKeepExif] = React.useState(false);

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setMode("fit");
    setWidth(p.w);
    setHeight(p.h);
  };

  const processFile = async (file: File): Promise<ProcessResult> => {
    const srcMime = await sniffMime(file);
    const img = await loadImage(file);
    try {
      const outMime: OutputMime =
        format === "jpeg"
          ? "image/jpeg"
          : format === "webp"
            ? "image/webp"
            : format === "png"
              ? "image/png"
              : (srcMime ?? "image/jpeg");

      let w = img.width;
      let h = img.height;
      if (mode === "percent") {
        const f = Math.max(1, percent) / 100;
        w = Math.round(img.width * f);
        h = Math.round(img.height * f);
      } else if (mode === "exact") {
        w = Math.round(Number.isFinite(width) && width > 0 ? width : img.width);
        h = Math.round(Number.isFinite(height) && height > 0 ? height : img.height);
      } else {
        const maxW = Number.isFinite(width) && width > 0 ? width : Infinity;
        const maxH = Number.isFinite(height) && height > 0 ? height : Infinity;
        let f = Math.min(maxW / img.width, maxH / img.height);
        if (!Number.isFinite(f)) f = 1;
        if (!allowUpscale) f = Math.min(f, 1);
        w = Math.round(img.width * f);
        h = Math.round(img.height * f);
      }
      w = Math.max(1, w);
      h = Math.max(1, h);

      const canvas = drawScaled(img, w, h, outMime === "image/jpeg" ? "#ffffff" : undefined);
      let blob =
        outMime === "image/png"
          ? await canvasToBlob(canvas, "image/png")
          : await canvasToBlob(canvas, outMime, quality / 100);

      if (keepExif && outMime === "image/jpeg" && srcMime === "image/jpeg") {
        const original = new Uint8Array(await file.arrayBuffer());
        blob = await carryJpegExif(original, blob, { stripGps: false, width: w, height: h });
      }

      return {
        blob,
        fileName: buildOutputName(file.name, `-${w}x${h}`, outMime),
        width: w,
        height: h,
      };
    } finally {
      img.dispose();
    }
  };

  const options = (
    <>
      <SelectField
        label={t("presetLabel")}
        value=""
        onChange={applyPreset}
        options={[
          { value: "", label: t("presetPlaceholder") },
          ...PRESETS.map((p) => ({ value: p.id, label: t(`preset.${p.id}`) })),
        ]}
      />
      <RadioGroupField
        label={t("modeLabel")}
        value={mode}
        onChange={(v) => setMode(v as Mode)}
        options={[
          { value: "fit", label: t("modeFit") },
          { value: "percent", label: t("modePercent") },
          { value: "exact", label: t("modeExact") },
        ]}
      />
      {mode === "percent" ? (
        <RangeField
          label={t("percentLabel")}
          value={percent}
          onChange={setPercent}
          min={5}
          max={200}
          display={`${percent}%`}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField
            label={t("widthLabel")}
            value={width}
            onChange={setWidth}
            min={0}
            max={16000}
            suffix="px"
          />
          <NumberField
            label={t("heightLabel")}
            value={height}
            onChange={setHeight}
            min={0}
            max={16000}
            suffix="px"
          />
          <p className="text-xs text-muted-foreground sm:col-span-2">
            {mode === "fit" ? t("fitHint") : t("exactHint")}
          </p>
        </div>
      )}
      {mode !== "exact" ? (
        <CheckField
          label={t("upscaleLabel")}
          hint={t("upscaleHint")}
          checked={allowUpscale}
          onChange={setAllowUpscale}
        />
      ) : null}
      <SelectField
        label={t("formatLabel")}
        value={format}
        onChange={(v) => setFormat(v as Format)}
        options={[
          { value: "auto", label: t("formatAuto") },
          { value: "jpeg", label: "JPG" },
          { value: "png", label: "PNG" },
          { value: "webp", label: "WebP" },
        ]}
      />
      {format !== "png" ? (
        <RangeField
          label={t("qualityLabel")}
          value={quality}
          onChange={setQuality}
          min={50}
          max={100}
        />
      ) : null}
      <CheckField
        label={t("keepExifLabel")}
        hint={t("keepExifHint")}
        checked={keepExif}
        onChange={setKeepExif}
      />
    </>
  );

  return (
    <BatchWorkbench
      options={options}
      process={processFile}
      zipName="exiflens-resized-images.zip"
    />
  );
}
