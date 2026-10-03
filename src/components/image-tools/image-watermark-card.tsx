"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BatchWorkbench, type ProcessResult } from "./batch-workbench";
import {
  CheckField,
  RadioGroupField,
  RangeField,
  SelectField,
  TextField,
} from "./fields";
import {
  buildOutputName,
  canvasToBlob,
  carryJpegExif,
  drawScaled,
  get2d,
  loadImage,
  sniffMime,
  type LoadedImage,
  type OutputMime,
} from "@/lib/image-ops";
import {
  renderWatermark,
  type WatermarkOptions,
  type WatermarkPosition,
} from "@/lib/watermark-render";

const POSITIONS: WatermarkPosition[] = [
  "tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br", "tile",
];

function PreviewCanvas({
  file,
  opts,
  logo,
}: {
  file: File;
  opts: WatermarkOptions;
  logo: LoadedImage | null;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const [img, setImg] = React.useState<LoadedImage | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let loaded: LoadedImage | null = null;
    loadImage(file)
      .then((l) => {
        if (cancelled) {
          l.dispose();
          return;
        }
        loaded = l;
        setImg(l);
      })
      .catch(() => setImg(null));
    return () => {
      cancelled = true;
      loaded?.dispose();
    };
  }, [file]);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !img) return;
    const scale = Math.min(1, 640 / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    canvas.width = w;
    canvas.height = h;
    const ctx = get2d(canvas);
    ctx.drawImage(img.source, 0, 0, w, h);
    renderWatermark(ctx, w, h, opts, logo?.source ?? null, logo ? { w: logo.width, h: logo.height } : null);
  }, [img, opts, logo]);

  return <canvas ref={ref} className="mx-auto block h-auto max-w-full rounded-md border border-border" />;
}

export function ImageWatermarkCard() {
  const t = useTranslations("ImageWatermark");
  const [type, setType] = React.useState<"text" | "image">("text");
  const [text, setText] = React.useState("© ExifLens");
  const [color, setColor] = React.useState("#ffffff");
  const [textSize, setTextSize] = React.useState(5);
  const [logoSize, setLogoSize] = React.useState(20);
  const [opacity, setOpacity] = React.useState(60);
  const [position, setPosition] = React.useState<WatermarkPosition>("br");
  const [margin, setMargin] = React.useState(3);
  const [angle, setAngle] = React.useState(0);
  const [shadow, setShadow] = React.useState(true);
  const [logo, setLogo] = React.useState<LoadedImage | null>(null);
  const [format, setFormat] = React.useState("auto");
  const [quality, setQuality] = React.useState(92);
  const [keepExif, setKeepExif] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  React.useEffect(() => {
    return () => logo?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opts: WatermarkOptions = React.useMemo(
    () => ({
      type,
      text,
      color,
      sizePct: type === "text" ? textSize : logoSize,
      opacity: opacity / 100,
      position,
      marginPct: margin,
      angle,
      shadow,
    }),
    [type, text, color, textSize, logoSize, opacity, position, margin, angle, shadow],
  );

  const onLogo = async (f: File | null) => {
    if (!f) return;
    setLogoError(false);
    try {
      const l = await loadImage(f);
      setLogo((prev) => {
        prev?.dispose();
        return l;
      });
    } catch {
      setLogoError(true);
    }
  };

  const changePosition = (v: string) => {
    const p = v as WatermarkPosition;
    setPosition(p);
    if (p === "tile" && angle === 0) setAngle(-30);
    if (p !== "tile" && angle === -30) setAngle(0);
  };

  const processFile = async (file: File): Promise<ProcessResult> => {
    const srcMime = await sniffMime(file);
    const img = await loadImage(file);
    try {
      const outMime: OutputMime =
        format === "jpeg"
          ? "image/jpeg"
          : format === "png"
            ? "image/png"
            : format === "webp"
              ? "image/webp"
              : (srcMime ?? "image/jpeg");
      const canvas = drawScaled(img, img.width, img.height, outMime === "image/jpeg" ? "#ffffff" : undefined);
      renderWatermark(
        get2d(canvas),
        canvas.width,
        canvas.height,
        opts,
        logo?.source ?? null,
        logo ? { w: logo.width, h: logo.height } : null,
      );
      let blob =
        outMime === "image/png"
          ? await canvasToBlob(canvas, "image/png")
          : await canvasToBlob(canvas, outMime, quality / 100);
      if (keepExif && outMime === "image/jpeg" && srcMime === "image/jpeg") {
        blob = await carryJpegExif(new Uint8Array(await file.arrayBuffer()), blob, {
          stripGps: false,
          width: canvas.width,
          height: canvas.height,
        });
      }
      return {
        blob,
        fileName: buildOutputName(file.name, "-watermarked", outMime),
        width: canvas.width,
        height: canvas.height,
      };
    } finally {
      img.dispose();
    }
  };

  const options = (
    <>
      <RadioGroupField
        label={t("typeLabel")}
        value={type}
        onChange={(v) => setType(v as "text" | "image")}
        options={[
          { value: "text", label: t("typeText") },
          { value: "image", label: t("typeImage") },
        ]}
      />
      {type === "text" ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <TextField label={t("textLabel")} value={text} onChange={setText} maxLength={80} />
          <label className="flex flex-col gap-1.5">
            <span>{t("colorLabel")}</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-16 cursor-pointer rounded-md border border-input bg-background p-1"
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span>{t("logoLabel")}</span>
          <input
            type="file"
            accept="image/png,image/webp,image/jpeg"
            onChange={(e) => onLogo(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          <span className="text-xs text-muted-foreground">{t("logoHint")}</span>
          {logoError ? <span className="text-xs text-destructive">{t("logoError")}</span> : null}
          {!logo && !logoError ? (
            <span className="text-xs text-muted-foreground">{t("logoRequired")}</span>
          ) : null}
        </label>
      )}
      <SelectField
        label={t("positionLabel")}
        value={position}
        onChange={changePosition}
        options={POSITIONS.map((p) => ({ value: p, label: t(`position.${p}`) }))}
      />
      <RangeField
        label={type === "text" ? t("textSizeLabel") : t("logoSizeLabel")}
        value={type === "text" ? textSize : logoSize}
        onChange={type === "text" ? setTextSize : setLogoSize}
        min={type === "text" ? 1 : 5}
        max={type === "text" ? 20 : 60}
        display={`${type === "text" ? textSize : logoSize}%`}
      />
      <RangeField label={t("opacityLabel")} value={opacity} onChange={setOpacity} min={10} max={100} display={`${opacity}%`} />
      {position !== "tile" ? (
        <RangeField label={t("marginLabel")} value={margin} onChange={setMargin} min={0} max={15} display={`${margin}%`} />
      ) : null}
      <RangeField label={t("angleLabel")} value={angle} onChange={setAngle} min={-45} max={45} display={`${angle}°`} />
      <CheckField label={t("shadowLabel")} checked={shadow} onChange={setShadow} />
      <SelectField
        label={t("formatLabel")}
        value={format}
        onChange={setFormat}
        options={[
          { value: "auto", label: t("formatAuto") },
          { value: "jpeg", label: "JPG" },
          { value: "png", label: "PNG" },
          { value: "webp", label: "WebP" },
        ]}
      />
      {format !== "png" ? (
        <RangeField label={t("qualityLabel")} value={quality} onChange={setQuality} min={50} max={100} />
      ) : null}
      <CheckField label={t("keepExifLabel")} hint={t("keepExifHint")} checked={keepExif} onChange={setKeepExif} />
    </>
  );

  return (
    <BatchWorkbench
      options={options}
      process={processFile}
      zipName="exiflens-watermarked-images.zip"
      showSizeChange={false}
      preview={(files) => (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">{t("previewNote")}</p>
          <PreviewCanvas file={files[0]} opts={opts} logo={logo} />
        </div>
      )}
    />
  );
}
