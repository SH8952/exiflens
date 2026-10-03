"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BatchWorkbench, type ProcessResult } from "./batch-workbench";
import { RadioGroupField, RangeField, SelectField } from "./fields";
import {
  ImageToolError,
  buildOutputName,
  canvasToBlob,
  drawScaled,
  loadImage,
  type OutputMime,
} from "@/lib/image-ops";

type Target = "jpeg" | "png" | "webp";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,.heic,.heif";
const EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif", "heic", "heif"];

const HEIC_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' rx='6' fill='#e5e7eb'/><text x='24' y='29' font-size='12' text-anchor='middle' fill='#6b7280' font-family='sans-serif'>HEIC</text></svg>",
  );

function isHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export function ImageConverterCard() {
  const t = useTranslations("ImageConverter");
  const [target, setTarget] = React.useState<Target>("jpeg");
  const [quality, setQuality] = React.useState(90);
  const [background, setBackground] = React.useState("#ffffff");

  const processFile = async (file: File): Promise<ProcessResult> => {
    let source: Blob = file;
    if (isHeic(file)) {
      try {
        const { default: heic2any } = await import("heic2any");
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.95 });
        source = Array.isArray(converted) ? converted[0] : converted;
      } catch {
        throw new ImageToolError("decode-failed");
      }
    }

    const img = await loadImage(source);
    try {
      const outMime: OutputMime =
        target === "jpeg" ? "image/jpeg" : target === "webp" ? "image/webp" : "image/png";
      const canvas = drawScaled(
        img,
        img.width,
        img.height,
        outMime === "image/jpeg" ? background : undefined,
      );
      const blob =
        outMime === "image/png"
          ? await canvasToBlob(canvas, "image/png")
          : await canvasToBlob(canvas, outMime, quality / 100);
      return {
        blob,
        fileName: buildOutputName(file.name, "", outMime),
        width: img.width,
        height: img.height,
      };
    } finally {
      img.dispose();
    }
  };

  const options = (
    <>
      <RadioGroupField
        label={t("targetLabel")}
        value={target}
        onChange={(v) => setTarget(v as Target)}
        options={[
          { value: "jpeg", label: "JPG" },
          { value: "png", label: "PNG" },
          { value: "webp", label: "WebP" },
        ]}
      />
      {target !== "png" ? (
        <RangeField
          label={t("qualityLabel")}
          value={quality}
          onChange={setQuality}
          min={50}
          max={100}
        />
      ) : null}
      {target === "jpeg" ? (
        <SelectField
          label={t("backgroundLabel")}
          hint={t("backgroundHint")}
          value={background}
          onChange={setBackground}
          options={[
            { value: "#ffffff", label: t("backgroundWhite") },
            { value: "#000000", label: t("backgroundBlack") },
          ]}
        />
      ) : null}
      <p className="text-xs text-muted-foreground">{t("metadataNote")}</p>
    </>
  );

  return (
    <BatchWorkbench
      options={options}
      process={processFile}
      zipName="exiflens-converted-images.zip"
      accept={ACCEPT}
      extensions={EXTENSIONS}
      showSizeChange={false}
      makeThumb={(file) => (isHeic(file) ? HEIC_PLACEHOLDER : null)}
    />
  );
}
