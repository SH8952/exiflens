"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Download, RotateCcw } from "lucide-react";
import { useExifStore } from "@/store/exif-store";
import { FILE_INPUT_ACCEPT, type ParsedExif } from "@/lib/exif";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { ExifUploader } from "@/components/exif-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ASPECT_RATIO_OPTIONS,
  canvasToBlob,
  downloadBlob,
  type AspectRatioOption,
  type FrameMetadata,
} from "@/lib/frame-canvas";
import {
  THEME_PRESETS,
  getThemeById,
  renderThemedFrame,
  type ThemeDefinition,
  type ThemeFont,
  type ThemeId,
} from "@/lib/theme-renderer";

const DEFAULT_PADDING_PERCENT = 4;

function metadataFromExif(data: ParsedExif | null): FrameMetadata {
  return {
    camera: data?.camera ?? "",
    lens: data?.lens ?? "",
    focalLength: data?.focalLength ?? "",
    aperture: data?.aperture ?? "",
    shutter: data?.shutterSpeedLabel ?? "",
    iso: data?.iso ?? "",
    takenAt: data?.takenAt ?? "",
  };
}

export function ExifFrameGenerator() {
  const t = useTranslations("Frame");
  const status = useExifStore((s) => s.status);
  const data = useExifStore((s) => s.data);
  const imageUrl = useExifStore((s) => s.imageUrl);
  const fileName = useExifStore((s) => s.fileName);

  if (status !== "success" || !imageUrl) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t("uploadHint")}</p>
        <ExifUploader />
      </div>
    );
  }

  // Keying by imageUrl remounts the editor (fresh image load + metadata
  // fields seeded from the new EXIF data) whenever the photo changes,
  // instead of an effect that would need to reset state imperatively.
  return (
    <FrameEditor
      key={imageUrl}
      imageUrl={imageUrl}
      data={data}
      fileName={fileName}
    />
  );
}

function FrameEditor({
  imageUrl,
  data,
  fileName,
}: {
  imageUrl: string;
  data: ParsedExif | null;
  fileName: string | null;
}) {
  const t = useTranslations("Frame");

  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = React.useState<AspectRatioOption>("original");
  const [paddingPercent, setPaddingPercent] = React.useState(
    DEFAULT_PADDING_PERCENT,
  );
  const [themeId, setThemeId] = React.useState<ThemeId>("classic-dark");
  const [customTheme, setCustomTheme] = React.useState<ThemeDefinition>({
    id: "custom",
    backgroundColor: "#111111",
    textColor: "#ffffff",
    subtextColor: "#a3a3a3",
    fontFamily: "sans",
    layoutStyle: "strap",
    paddingPercent: DEFAULT_PADDING_PERCENT,
    showBrandBadge: true,
  });
  const [metadata, setMetadata] = React.useState<FrameMetadata>(() =>
    metadataFromExif(data),
  );
  const [exportFormat, setExportFormat] = React.useState<"png" | "jpeg">(
    "png",
  );
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const replaceInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const { handleFile: handleReplacePhoto } = usePhotoUpload();

  React.useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setImage(img);
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  React.useEffect(() => {
    if (!image || !canvasRef.current) return;
    renderThemedFrame(
      image,
      { themeId, aspect, paddingPercent, metadata, customTheme },
      canvasRef.current,
    );
  }, [image, themeId, aspect, paddingPercent, metadata, customTheme]);

  // Switching theme applies that preset's recommended padding too (the
  // slider still overrides it afterward, same as any preset). "Custom"
  // isn't in THEME_PRESETS, so its remembered padding lives on customTheme.
  const handleThemeChange = (nextId: ThemeId) => {
    setThemeId(nextId);
    setPaddingPercent(
      nextId === "custom" ? customTheme.paddingPercent : getThemeById(nextId).paddingPercent,
    );
  };

  const handleMetadataChange = (field: keyof FrameMetadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetMetadata = () => setMetadata(metadataFromExif(data));

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current, exportFormat);
    const base = (fileName ?? "photo").replace(/\.[^/.]+$/, "");
    downloadBlob(blob, `${base}-framed.${exportFormat === "jpeg" ? "jpg" : "png"}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => replaceInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") replaceInputRef.current?.click();
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleReplacePhoto(e.dataTransfer.files?.[0]);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-colors",
            isDragging && "border-primary bg-primary/5",
          )}
        >
          <input
            ref={replaceInputRef}
            type="file"
            accept={FILE_INPUT_ACCEPT}
            className="sr-only"
            onChange={(e) => {
              void handleReplacePhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <canvas ref={canvasRef} className="h-auto w-full" />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-medium text-white opacity-0 transition-opacity",
              isDragging && "opacity-100",
              "group-hover:opacity-100",
            )}
          >
            {t("dropToReplace")}
          </div>
        </div>
        <Button onClick={handleDownload} className="self-start" disabled={!image}>
          <Download className="size-4" />
          {t("downloadButton")}
        </Button>
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("themeLabel")}</span>
          <Select
            value={themeId}
            onValueChange={(value) => handleThemeChange(value as ThemeId)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {t(`themes.${preset.id}`)}
                </SelectItem>
              ))}
              <SelectItem value="custom">{t("themes.custom")}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        {themeId === "custom" && (
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">{t("customBackground")}</span>
                <input
                  type="color"
                  value={customTheme.backgroundColor}
                  onChange={(e) =>
                    setCustomTheme((prev) => ({ ...prev, backgroundColor: e.target.value }))
                  }
                  className="h-9 w-full cursor-pointer rounded-md border border-input bg-transparent p-1"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">{t("customText")}</span>
                <input
                  type="color"
                  value={customTheme.textColor}
                  onChange={(e) =>
                    setCustomTheme((prev) => ({ ...prev, textColor: e.target.value }))
                  }
                  className="h-9 w-full cursor-pointer rounded-md border border-input bg-transparent p-1"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">{t("customFont")}</span>
              <Select
                value={customTheme.fontFamily}
                onValueChange={(value) =>
                  setCustomTheme((prev) => ({ ...prev, fontFamily: value as ThemeFont }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">Sans</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mono">Mono</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <button
              type="button"
              onClick={() =>
                setCustomTheme((prev) => ({
                  ...prev,
                  showBrandBadge: !(prev.showBrandBadge !== false),
                }))
              }
              className="flex items-center justify-between rounded-md border border-input px-3 py-2 text-xs"
            >
              <span className="text-muted-foreground">{t("customShowLogo")}</span>
              <span
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  customTheme.showBrandBadge !== false ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block size-4 translate-x-0.5 rounded-full bg-white transition-transform",
                    customTheme.showBrandBadge !== false && "translate-x-4",
                  )}
                />
              </span>
            </button>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("aspectLabel")}</span>
          <Select
            value={aspect}
            onValueChange={(value) => setAspect(value as AspectRatioOption)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIO_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "original" ? t("aspectOriginal") : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-center justify-between text-muted-foreground">
            <span>{t("paddingLabel")}</span>
            <span className="tabular-nums">{paddingPercent}%</span>
          </span>
          <Slider
            min={0}
            max={10}
            step={1}
            value={paddingPercent}
            onChange={(e) => {
              const value = Number(e.target.value);
              setPaddingPercent(value);
              if (themeId === "custom") {
                setCustomTheme((prev) => ({ ...prev, paddingPercent: value }));
              }
            }}
          />
        </label>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("metadataLabel")}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetMetadata}
            >
              <RotateCcw className="size-3.5" />
              {t("metadataReset")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("metadataHint")}</p>

          <MetadataField
            label={t("camera")}
            value={metadata.camera}
            onChange={(v) => handleMetadataChange("camera", v)}
          />
          <MetadataField
            label={t("lens")}
            value={metadata.lens}
            onChange={(v) => handleMetadataChange("lens", v)}
          />
          <div className="grid grid-cols-2 gap-2">
            <MetadataField
              label={t("focalLength")}
              value={metadata.focalLength}
              onChange={(v) => handleMetadataChange("focalLength", v)}
            />
            <MetadataField
              label={t("aperture")}
              value={metadata.aperture}
              onChange={(v) => handleMetadataChange("aperture", v)}
            />
            <MetadataField
              label={t("shutter")}
              value={metadata.shutter}
              onChange={(v) => handleMetadataChange("shutter", v)}
            />
            <MetadataField
              label={t("iso")}
              value={metadata.iso}
              onChange={(v) => handleMetadataChange("iso", v)}
            />
          </div>
          <MetadataField
            label={t("takenAt")}
            value={metadata.takenAt}
            onChange={(v) => handleMetadataChange("takenAt", v)}
          />
        </div>

        <label className="flex flex-col gap-1.5 border-t border-border pt-4">
          <span className="text-muted-foreground">{t("formatLabel")}</span>
          <Select
            value={exportFormat}
            onValueChange={(value) => setExportFormat(value as "png" | "jpeg")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpeg">JPG</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
    </div>
  );
}

function MetadataField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
