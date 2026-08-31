"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Download, RotateCcw } from "lucide-react";
import { useExifStore } from "@/store/exif-store";
import { FILE_INPUT_ACCEPT, isCanvasUnsupportedFormat, type ParsedExif } from "@/lib/exif";
import { extractRawPreviewBlob, isRawExtension } from "@/lib/raw-exif";
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
  loadImageForFrame,
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
    // Tip/Poster fields are unrelated to camera EXIF, so they always start
    // from the same placeholder defaults regardless of the uploaded photo.
    tipLabel: "TIP",
    tipHeading: "01. Lorem ipsum",
    tipBody1: "Pellentesque a pharetra justo",
    tipBody2: "Nam maximus risus et rhoncus eleifend",
    posterDate: "2001.01.01",
    posterTitle1: "Lorem Ipsum",
    posterTitle2: "dolor sit amet, consectetur",
    posterLocationName: "White House",
    posterLocationAddress: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
  };
}

/** Base definition for the fully free-form "Custom" theme — everything
 * else copies its base preset's values when selected (see handleThemeChange). */
const CUSTOM_THEME_BASE: ThemeDefinition = {
  id: "custom",
  backgroundColor: "#111111",
  textColor: "#ffffff",
  subtextColor: "#a3a3a3",
  fontFamily: "sans",
  layoutStyle: "strap",
  paddingPercent: DEFAULT_PADDING_PERCENT,
  showBrandBadge: true,
};

export function ExifFrameGenerator() {
  const t = useTranslations("Frame");
  const status = useExifStore((s) => s.status);
  const data = useExifStore((s) => s.data);
  const imageUrl = useExifStore((s) => s.imageUrl);
  const fileName = useExifStore((s) => s.fileName);
  const file = useExifStore((s) => s.file);

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
      file={file}
    />
  );
}

function FrameEditor({
  imageUrl,
  data,
  fileName,
  file,
}: {
  imageUrl: string;
  data: ParsedExif | null;
  fileName: string | null;
  file: File | null;
}) {
  const t = useTranslations("Frame");

  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  // Surfaces *why* the photo failed to load/render instead of leaving the
  // preview box silently blank (the mobile bug this was added to diagnose:
  // 2026-08-31, 사진이 안 보이는데 원인을 알 수 없어 재현 확인이 어려웠음). A short,
  // literal error string is more useful here than another translated
  // message — this is a diagnostic detail, not normal UI copy.
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [aspect, setAspect] = React.useState<AspectRatioOption>("original");
  const [paddingPercent, setPaddingPercent] = React.useState(
    DEFAULT_PADDING_PERCENT,
  );
  const [themeId, setThemeId] = React.useState<ThemeId>("classic-dark");
  // The currently active, user-editable theme definition — every preset's
  // colors/font/padding/logo-visibility can be tweaked from its defaults,
  // not just "Custom" (석한 요청: "모든 테마에 ... 커스텀 가능하도록"). Reset to
  // the newly-selected preset's own defaults on every theme switch, kept in
  // sync via handleThemeChange below.
  const [customTheme, setCustomTheme] = React.useState<ThemeDefinition>(() => ({
    ...getThemeById("classic-dark"),
  }));
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
    let revocableUrl: string | null = null;
    // No synchronous reset needed here: FrameEditor is remounted (`key={imageUrl}`)
    // whenever the photo changes, so `loadError`/`image` already start at their
    // initial `null` values for a new photo.

    // HEIC/HEIF files parse EXIF fine but no browser can decode them as a
    // raster image — attempting to anyway just produces a generic "failed to
    // decode" error with no useful next step. Catch that up front and tell
    // the user exactly what to do instead (2026-08-31, 모바일 "이미지를 디코딩하지
    // 못했습니다" 오류의 실제 원인 확인).
    if (isCanvasUnsupportedFormat(fileName ?? "", file?.type ?? null)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: skip the decode attempt entirely for a known-unrenderable format.
      setLoadError(t("loadErrorUnsupportedFormat"));
      return;
    }

    // RAW files (.arw/.cr2/.dng/...) can't be decoded as an <img>/canvas
    // source directly either, but almost every RAW file embeds a JPEG
    // preview (the same image the camera's LCD shows) — extract that via
    // LibRaw and use it as the photo source instead (2026-08-31, RAW 업로드가
    // 실패하는 근본 원인이 exifreader의 RAW 미지원이었음을 확인한 뒤 추가:
    // isSupportedImageFile/RAW_EXTENSIONS와 마찬가지로 @/lib/raw-exif 참고).
    if (isRawExtension(fileName ?? "") && file) {
      extractRawPreviewBlob(file)
        .then((blob) => {
          if (cancelled) return;
          if (!blob) {
            setLoadError(t("loadErrorRawNoPreview"));
            return;
          }
          const previewUrl = URL.createObjectURL(blob);
          revocableUrl = previewUrl;
          return loadImageForFrame(previewUrl).then((img) => {
            if (!cancelled) setImage(img);
          });
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setImage(null);
          setLoadError(t("loadError", { reason: err instanceof Error ? err.message : String(err) }));
        });
      return () => {
        cancelled = true;
        if (revocableUrl) URL.revokeObjectURL(revocableUrl);
      };
    }

    loadImageForFrame(imageUrl)
      .then((img) => {
        if (!cancelled) setImage(img);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setImage(null);
        setLoadError(t("loadError", { reason: err instanceof Error ? err.message : String(err) }));
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrl, fileName, file, t]);

  React.useEffect(() => {
    if (!image || !canvasRef.current) return;
    try {
      renderThemedFrame(
        image,
        { themeId, aspect, paddingPercent, metadata, customTheme },
        canvasRef.current,
      );
      // Clears an error from a *previous* render attempt (e.g. the user
      // fixed a transient issue by switching themes/aspect) — this isn't a
      // decorative reset, it's the effect's actual result.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadError(null);
    } catch (err) {
      setLoadError(
        t("loadError", { reason: err instanceof Error ? err.message : String(err) }),
      );
    }
  }, [image, themeId, aspect, paddingPercent, metadata, customTheme, t]);

  // Switching theme resets the editable overrides (colors/font/padding/logo)
  // to the newly-selected preset's own defaults — predictable behavior
  // confirmed with 석한 (테마 전환 시 이전 수정값이 아니라 새 테마 기본값으로 초기화).
  // "Custom" isn't in THEME_PRESETS, so it falls back to CUSTOM_THEME_BASE.
  const handleThemeChange = (nextId: ThemeId) => {
    setThemeId(nextId);
    const base = nextId === "custom" ? CUSTOM_THEME_BASE : getThemeById(nextId);
    setCustomTheme({ ...base });
    setPaddingPercent(base.paddingPercent);
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
              // `group-hover` alone never triggers on touch devices (no
              // mouse to hover with), so the replace hint was invisible on
              // mobile — this box just looked like a dead black box with no
              // affordance. Shown at a low, always-on opacity by default so
              // touch users still see it, and only faded out on pointers
              // that support real hovering (desktop mice/trackpads).
              "pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-medium text-white opacity-70 transition-opacity md:opacity-0",
              isDragging && "opacity-100",
              "md:group-hover:opacity-100",
            )}
          >
            {t("dropToReplace")}
          </div>
        </div>
        {loadError ? (
          <p role="alert" className="text-sm text-destructive">
            {loadError}
          </p>
        ) : null}
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
              setCustomTheme((prev) => ({ ...prev, paddingPercent: value }));
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

          {themeId === "tip" ? (
            <>
              <MetadataField
                label={t("tipLabel")}
                value={metadata.tipLabel}
                onChange={(v) => handleMetadataChange("tipLabel", v)}
              />
              <MetadataField
                label={t("tipHeading")}
                value={metadata.tipHeading}
                onChange={(v) => handleMetadataChange("tipHeading", v)}
              />
              <MetadataField
                label={t("tipBody1")}
                value={metadata.tipBody1}
                onChange={(v) => handleMetadataChange("tipBody1", v)}
              />
              <MetadataField
                label={t("tipBody2")}
                value={metadata.tipBody2}
                onChange={(v) => handleMetadataChange("tipBody2", v)}
              />
            </>
          ) : themeId === "poster" ? (
            <>
              <MetadataField
                label={t("posterDate")}
                value={metadata.posterDate}
                onChange={(v) => handleMetadataChange("posterDate", v)}
              />
              <MetadataField
                label={t("posterTitle1")}
                value={metadata.posterTitle1}
                onChange={(v) => handleMetadataChange("posterTitle1", v)}
              />
              <MetadataField
                label={t("posterTitle2")}
                value={metadata.posterTitle2}
                onChange={(v) => handleMetadataChange("posterTitle2", v)}
              />
              <MetadataField
                label={t("posterLocationName")}
                value={metadata.posterLocationName}
                onChange={(v) => handleMetadataChange("posterLocationName", v)}
              />
              <MetadataField
                label={t("posterLocationAddress")}
                value={metadata.posterLocationAddress}
                onChange={(v) => handleMetadataChange("posterLocationAddress", v)}
              />
            </>
          ) : (
            <>
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
            </>
          )}
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
