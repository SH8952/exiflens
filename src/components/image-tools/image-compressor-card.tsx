"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BatchWorkbench, type ProcessResult } from "./batch-workbench";
import {
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
  encodeToTargetSize,
  loadImage,
  sniffMime,
  type OutputMime,
} from "@/lib/image-ops";

type Mode = "quality" | "target";
type Format = "auto" | "jpeg" | "webp";
type Metadata = "strip" | "keep" | "gps";

export function ImageCompressorCard() {
  const t = useTranslations("ImageCompressor");
  const [mode, setMode] = React.useState<Mode>("quality");
  const [quality, setQuality] = React.useState(80);
  const [targetKb, setTargetKb] = React.useState(500);
  const [maxWidth, setMaxWidth] = React.useState("0");
  const [format, setFormat] = React.useState<Format>("auto");
  const [metadata, setMetadata] = React.useState<Metadata>("strip");
  const [note, setNote] = React.useState<string | null>(null);

  const processFile = async (file: File): Promise<ProcessResult> => {
    setNote(null);
    const srcMime = await sniffMime(file);
    const img = await loadImage(file);
    try {
      const outMime: OutputMime =
        format === "jpeg"
          ? "image/jpeg"
          : format === "webp"
            ? "image/webp"
            : (srcMime ?? "image/jpeg");

      const limit = Number(maxWidth);
      const scale = limit > 0 && img.width > limit ? limit / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = drawScaled(img, w, h, outMime === "image/jpeg" ? "#ffffff" : undefined);

      let blob: Blob;
      if (outMime === "image/png") {
        blob = await canvasToBlob(canvas, "image/png");
      } else if (mode === "target") {
        const result = await encodeToTargetSize(
          canvas,
          outMime,
          Math.max(1, targetKb) * 1024,
        );
        blob = result.blob;
        if (result.missedTarget) setNote(t("missedTarget"));
      } else {
        blob = await canvasToBlob(canvas, outMime, quality / 100);
      }

      const canKeepExif = outMime === "image/jpeg" && srcMime === "image/jpeg";
      if (canKeepExif && metadata !== "strip") {
        const original = new Uint8Array(await file.arrayBuffer());
        blob = await carryJpegExif(original, blob, {
          stripGps: metadata === "gps",
          width: w,
          height: h,
        });
        // 압축했는데 오히려 커졌고, 크기 변경도 없다면 원본을 그대로 돌려준다.
        if (scale === 1 && blob.size >= file.size && metadata === "keep") {
          blob = new Blob([original], { type: "image/jpeg" });
        }
      }

      return {
        blob,
        fileName: buildOutputName(file.name, "-compressed", outMime),
        width: w,
        height: h,
      };
    } finally {
      img.dispose();
    }
  };

  const widthOptions = [
    { value: "0", label: t("widthOriginal") },
    { value: "3840", label: "3840px (4K)" },
    { value: "2560", label: "2560px" },
    { value: "1920", label: "1920px (Full HD)" },
    { value: "1600", label: "1600px" },
    { value: "1280", label: "1280px" },
    { value: "1024", label: "1024px" },
    { value: "800", label: "800px" },
  ];

  const options = (
    <>
      <RadioGroupField
        label={t("modeLabel")}
        value={mode}
        onChange={(v) => setMode(v as Mode)}
        options={[
          { value: "quality", label: t("modeQuality") },
          { value: "target", label: t("modeTarget") },
        ]}
      />
      {mode === "quality" ? (
        <RangeField
          label={t("qualityLabel")}
          value={quality}
          onChange={setQuality}
          min={10}
          max={100}
          display={`${quality}`}
        />
      ) : (
        <NumberField
          label={t("targetLabel")}
          hint={t("targetHint")}
          value={targetKb}
          onChange={setTargetKb}
          min={10}
          max={20000}
          suffix="KB"
        />
      )}
      <SelectField
        label={t("widthLabel")}
        hint={t("widthHint")}
        value={maxWidth}
        onChange={setMaxWidth}
        options={widthOptions}
      />
      <SelectField
        label={t("formatLabel")}
        hint={t("formatHint")}
        value={format}
        onChange={(v) => setFormat(v as Format)}
        options={[
          { value: "auto", label: t("formatAuto") },
          { value: "jpeg", label: "JPG" },
          { value: "webp", label: "WebP" },
        ]}
      />
      <RadioGroupField
        label={t("metadataLabel")}
        value={metadata}
        onChange={(v) => setMetadata(v as Metadata)}
        options={[
          { value: "strip", label: t("metadataStrip") },
          { value: "gps", label: t("metadataGps") },
          { value: "keep", label: t("metadataKeep") },
        ]}
      />
      <p className="text-xs text-muted-foreground">{t("metadataHint")}</p>
      {note ? <p className="text-xs text-destructive">{note}</p> : null}
    </>
  );

  return (
    <BatchWorkbench
      options={options}
      process={processFile}
      zipName="exiflens-compressed-images.zip"
      acceptHandoff
    />
  );
}
