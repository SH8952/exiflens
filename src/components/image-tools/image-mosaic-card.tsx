"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckField, RadioGroupField, RangeField, SelectField } from "./fields";
import {
  ImageToolError,
  buildOutputName,
  canvasToBlob,
  carryJpegExif,
  createCanvas,
  formatBytes,
  get2d,
  loadImage,
  sniffMime,
  assertCanvasSize,
  type LoadedImage,
  type OutputMime,
} from "@/lib/image-ops";
import {
  renderMosaic,
  type MosaicEffect,
  type MosaicRegion,
  type MosaicShape,
} from "@/lib/mosaic-render";

const MIN_REGION = 6;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function ImageMosaicCard() {
  const t = useTranslations("ImageMosaic");
  const [file, setFile] = React.useState<File | null>(null);
  const [img, setImg] = React.useState<LoadedImage | null>(null);
  const [regions, setRegions] = React.useState<MosaicRegion[]>([]);
  const [draft, setDraft] = React.useState<MosaicRegion | null>(null);
  const [shape, setShape] = React.useState<MosaicShape>("rect");
  const [effect, setEffect] = React.useState<MosaicEffect>("pixelate");
  const [strength, setStrength] = React.useState(7);
  const [format, setFormat] = React.useState("auto");
  const [quality, setQuality] = React.useState(92);
  const [keepExif, setKeepExif] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [result, setResult] = React.useState<{ url: string; name: string; size: number } | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const startRef = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    return () => img?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearResult = () =>
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });

  const onFile = async (f: File | null) => {
    if (!f) return;
    setError(null);
    clearResult();
    try {
      const loaded = await loadImage(f);
      assertCanvasSize(loaded.width, loaded.height);
      setImg((prev) => {
        prev?.dispose();
        return loaded;
      });
      setFile(f);
      setRegions([]);
      setDraft(null);
    } catch (e) {
      setError(t(e instanceof ImageToolError && e.message === "too-large" ? "errTooLarge" : "errDecode"));
    }
  };

  const acceptDrop = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const f = Array.from(list).find(
      (x) => /^image\/(jpeg|png|webp)$/.test(x.type) || /\.(jpe?g|png|webp)$/i.test(x.name),
    );
    if (!f) {
      setError(t("errNotImage"));
      return;
    }
    void onFile(f);
  };

  // 화면 갱신
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const scale = Math.min(1, 960 / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    canvas.width = w;
    canvas.height = h;
    const ctx = get2d(canvas);
    renderMosaic(ctx, img.source, img.width, img.height, w, h, regions, effect, strength);
    if (draft) {
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 3;
      ctx.beginPath();
      const dx = draft.x * scale;
      const dy = draft.y * scale;
      const dw = draft.w * scale;
      const dh = draft.h * scale;
      if (draft.shape === "ellipse") {
        ctx.ellipse(dx + dw / 2, dy + dh / 2, Math.max(1, dw / 2), Math.max(1, dh / 2), 0, 0, Math.PI * 2);
      } else {
        ctx.rect(dx, dy, dw, dh);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [img, regions, draft, effect, strength]);

  const toPoint = (e: React.PointerEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - r.left) / r.width) * img!.width, 0, img!.width),
      y: clamp(((e.clientY - r.top) / r.height) * img!.height, 0, img!.height),
    };
  };

  const rectFrom = (a: { x: number; y: number }, b: { x: number; y: number }): MosaicRegion => ({
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
    shape,
  });

  const onDown = (e: React.PointerEvent) => {
    if (!img) return;
    e.preventDefault();
    wrapRef.current?.setPointerCapture(e.pointerId);
    startRef.current = toPoint(e);
    setDraft(null);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!startRef.current || !img) return;
    setDraft(rectFrom(startRef.current, toPoint(e)));
  };
  const onUp = (e: React.PointerEvent) => {
    if (!startRef.current || !img) return;
    const region = rectFrom(startRef.current, toPoint(e));
    startRef.current = null;
    setDraft(null);
    if (region.w >= MIN_REGION && region.h >= MIN_REGION) {
      setRegions((prev) => [...prev, region]);
      clearResult();
    }
  };

  const createResult = async () => {
    if (!img || !file) return;
    setBusy(true);
    setError(null);
    try {
      const srcMime = await sniffMime(file);
      const outMime: OutputMime =
        format === "jpeg"
          ? "image/jpeg"
          : format === "png"
            ? "image/png"
            : format === "webp"
              ? "image/webp"
              : (srcMime ?? "image/jpeg");
      const canvas = createCanvas(img.width, img.height);
      const ctx = get2d(canvas);
      if (outMime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      renderMosaic(ctx, img.source, img.width, img.height, canvas.width, canvas.height, regions, effect, strength);
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
      const url = URL.createObjectURL(blob);
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url, name: buildOutputName(file.name, "-mosaic", outMime), size: blob.size };
      });
    } catch (e) {
      setError(t(e instanceof ImageToolError && e.message === "format-unsupported" ? "errFormat" : "errEncode"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-card p-5 transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      // 카드 어디에 놓아도 받는다 (편집 화면 위에 놓아도 브라우저가 새 탭으로 열지 않게)
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        acceptDrop(e.dataTransfer.files);
      }}
    >
      <p className="mb-4 text-xs text-muted-foreground">{t("privacyNote")}</p>

      <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 text-center text-sm">
        <p className="font-medium">{t("dropLabel")}</p>
        <p className="text-xs text-muted-foreground">{t("dropHint")}</p>
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          {t("selectButton")}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            void onFile(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      {img ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">{t("drawHint")}</p>

          <div className="flex justify-center">
            <div
              ref={wrapRef}
              className="relative max-w-full cursor-crosshair select-none overflow-hidden rounded-md border border-border"
              style={{ touchAction: "none", width: "min(100%, 960px)" }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => {
                startRef.current = null;
                setDraft(null);
              }}
            >
              <canvas ref={canvasRef} className="block h-auto w-full" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{t("regionCount", { count: regions.length })}</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={regions.length === 0}
              onClick={() => {
                setRegions((r) => r.slice(0, -1));
                clearResult();
              }}
            >
              {t("undo")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={regions.length === 0}
              onClick={() => {
                setRegions([]);
                clearResult();
              }}
            >
              {t("clear")}
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border px-3 py-3 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("optionsTitle")}
            </h3>
            <RadioGroupField
              label={t("effectLabel")}
              value={effect}
              onChange={(v) => {
                setEffect(v as MosaicEffect);
                clearResult();
              }}
              options={[
                { value: "pixelate", label: t("effectPixelate") },
                { value: "blur", label: t("effectBlur") },
                { value: "black", label: t("effectBlack") },
              ]}
            />
            {effect !== "black" ? (
              <RangeField
                label={t("strengthLabel")}
                value={strength}
                onChange={(v) => {
                  setStrength(v);
                  clearResult();
                }}
                min={1}
                max={10}
              />
            ) : null}
            <RadioGroupField
              label={t("shapeLabel")}
              value={shape}
              onChange={(v) => setShape(v as MosaicShape)}
              options={[
                { value: "rect", label: t("shapeRect") },
                { value: "ellipse", label: t("shapeEllipse") },
              ]}
            />
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
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={createResult} disabled={busy || regions.length === 0}>
              {busy ? t("processingButton") : t("applyButton")}
            </Button>
            {result ? (
              <a href={result.url} download={result.name} className="text-sm text-primary underline underline-offset-2">
                {t("downloadResult", { name: result.name, size: formatBytes(result.size) })}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
