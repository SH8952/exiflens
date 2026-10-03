"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckField, RangeField, SelectField } from "./fields";
import {
  ImageToolError,
  assertCanvasSize,
  buildOutputName,
  canvasToBlob,
  carryJpegExif,
  createCanvas,
  formatBytes,
  get2d,
  loadImage,
  sniffMime,
  type LoadedImage,
  type OutputMime,
} from "@/lib/image-ops";

type Rect = { x: number; y: number; w: number; h: number };
type Handle = "nw" | "ne" | "sw" | "se";
type Drag =
  | { kind: "draw"; ax: number; ay: number }
  | { kind: "resize"; ax: number; ay: number }
  | { kind: "move"; offX: number; offY: number };

const ASPECTS: { id: string; ratio: number | null }[] = [
  { id: "free", ratio: null },
  { id: "1:1", ratio: 1 },
  { id: "4:3", ratio: 4 / 3 },
  { id: "3:2", ratio: 3 / 2 },
  { id: "16:9", ratio: 16 / 9 },
  { id: "3:4", ratio: 3 / 4 },
  { id: "2:3", ratio: 2 / 3 },
  { id: "9:16", ratio: 9 / 16 },
];

const MIN_SIZE = 8;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** 회전(90° 단위)·뒤집기를 적용한 전체 해상도 캔버스를 만든다. */
function buildBase(img: LoadedImage, rot: number, flipH: boolean, flipV: boolean) {
  const swap = rot % 2 === 1;
  const w = swap ? img.height : img.width;
  const h = swap ? img.width : img.height;
  assertCanvasSize(w, h);
  const canvas = createCanvas(w, h);
  const ctx = get2d(canvas);
  ctx.translate(w / 2, h / 2);
  ctx.rotate((rot * Math.PI) / 2);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img.source, -img.width / 2, -img.height / 2);
  return canvas;
}

export function ImageCropRotateCard() {
  const t = useTranslations("ImageCropRotate");
  const [file, setFile] = React.useState<File | null>(null);
  const [img, setImg] = React.useState<LoadedImage | null>(null);
  const [rot, setRot] = React.useState(0);
  const [flipH, setFlipH] = React.useState(false);
  const [flipV, setFlipV] = React.useState(false);
  const [aspectId, setAspectId] = React.useState("free");
  const [imgVersion, setImgVersion] = React.useState(0);
  const [cropState, setCropState] = React.useState<{ key: string; rect: Rect } | null>(null);
  const [format, setFormat] = React.useState("auto");
  const [quality, setQuality] = React.useState(92);
  const [keepExif, setKeepExif] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resultState, setResultState] = React.useState<{
    key: string;
    url: string;
    name: string;
    size: number;
    w: number;
    h: number;
  } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<Drag | null>(null);

  // 회전/뒤집기를 적용한 전체 해상도 기준 캔버스 (파생값)
  const baseResult = React.useMemo(() => {
    if (!img) return null;
    try {
      return { canvas: buildBase(img, rot, flipH, flipV), failed: false };
    } catch {
      return { canvas: null, failed: true };
    }
  }, [img, rot, flipH, flipV]);
  const base = baseResult?.canvas ?? null;
  const baseSize = base ? { w: base.width, h: base.height } : null;

  // 이미지·회전·뒤집기가 바뀌면 자르기 영역과 결과를 초기 상태로 되돌린다 (key 비교)
  const cropKey = `${imgVersion}-${rot}-${flipH}-${flipV}`;
  const crop: Rect | null =
    baseSize === null
      ? null
      : cropState && cropState.key === cropKey
        ? cropState.rect
        : { x: 0, y: 0, w: baseSize.w, h: baseSize.h };
  const setCrop = (rect: Rect) => setCropState({ key: cropKey, rect });
  const result = resultState && resultState.key === cropKey ? resultState : null;

  const aspect = ASPECTS.find((a) => a.id === aspectId)?.ratio ?? null;

  // 파일 로드
  const onFile = async (f: File | null) => {
    if (!f) return;
    setError(null);
    setResultState((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    try {
      const loaded = await loadImage(f);
      setImg((prev) => {
        prev?.dispose();
        return loaded;
      });
      setFile(f);
      setImgVersion((v) => v + 1);
      setRot(0);
      setFlipH(false);
      setFlipV(false);
      setAspectId("free");
    } catch (e) {
      setError(t(e instanceof ImageToolError && e.message === "too-large" ? "errTooLarge" : "errDecode"));
    }
  };

  React.useEffect(() => {
    return () => {
      img?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 화면 캔버스 그리기
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!base || !canvas) return;
    const maxW = 960;
    const scale = Math.min(1, maxW / base.width);
    canvas.width = Math.round(base.width * scale);
    canvas.height = Math.round(base.height * scale);
    const ctx = get2d(canvas);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
  }, [base]);

  const toBasePoint = (e: React.PointerEvent) => {
    const wrap = wrapRef.current!;
    const r = wrap.getBoundingClientRect();
    const bw = baseSize!.w;
    const bh = baseSize!.h;
    return {
      x: clamp(((e.clientX - r.left) / r.width) * bw, 0, bw),
      y: clamp(((e.clientY - r.top) / r.height) * bh, 0, bh),
    };
  };

  const rectFromAnchor = (ax: number, ay: number, px: number, py: number): Rect => {
    const bw = baseSize!.w;
    const bh = baseSize!.h;
    const sx = px >= ax ? 1 : -1;
    const sy = py >= ay ? 1 : -1;
    let w = Math.abs(px - ax);
    let h = Math.abs(py - ay);
    const maxW = sx > 0 ? bw - ax : ax;
    const maxH = sy > 0 ? bh - ay : ay;
    if (aspect) {
      if (w / aspect > h) h = w / aspect;
      else w = h * aspect;
      if (w > maxW) {
        w = maxW;
        h = w / aspect;
      }
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }
    } else {
      w = Math.min(w, maxW);
      h = Math.min(h, maxH);
    }
    return { x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - h, w, h };
  };

  const onPointerDown = (e: React.PointerEvent, handle?: Handle) => {
    if (!baseSize || !crop) return;
    e.preventDefault();
    wrapRef.current?.setPointerCapture(e.pointerId);
    const p = toBasePoint(e);
    if (handle) {
      const ax = handle === "nw" || handle === "sw" ? crop.x + crop.w : crop.x;
      const ay = handle === "nw" || handle === "ne" ? crop.y + crop.h : crop.y;
      dragRef.current = { kind: "resize", ax, ay };
      return;
    }
    const inside = p.x >= crop.x && p.x <= crop.x + crop.w && p.y >= crop.y && p.y <= crop.y + crop.h;
    const isFull = crop.w >= baseSize.w - 1 && crop.h >= baseSize.h - 1;
    if (inside && !isFull) {
      dragRef.current = { kind: "move", offX: p.x - crop.x, offY: p.y - crop.y };
    } else {
      dragRef.current = { kind: "draw", ax: p.x, ay: p.y };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !baseSize || !crop) return;
    const p = toBasePoint(e);
    if (drag.kind === "move") {
      setCrop({
        ...crop,
        x: clamp(p.x - drag.offX, 0, baseSize.w - crop.w),
        y: clamp(p.y - drag.offY, 0, baseSize.h - crop.h),
      });
    } else {
      const next = rectFromAnchor(drag.ax, drag.ay, p.x, p.y);
      setCrop(next);
    }
  };

  const onPointerUp = () => {
    dragRef.current = null;
    if (crop && baseSize && (crop.w < MIN_SIZE || crop.h < MIN_SIZE)) {
      setCrop({ x: 0, y: 0, w: baseSize.w, h: baseSize.h });
    }
  };

  const applyAspect = (id: string) => {
    setAspectId(id);
    const ratio = ASPECTS.find((a) => a.id === id)?.ratio ?? null;
    if (!ratio || !crop || !baseSize) return;
    let w = crop.w;
    let h = crop.h;
    if (w / h > ratio) w = h * ratio;
    else h = w / ratio;
    const cx = crop.x + crop.w / 2;
    const cy = crop.y + crop.h / 2;
    setCrop({
      x: clamp(cx - w / 2, 0, baseSize.w - w),
      y: clamp(cy - h / 2, 0, baseSize.h - h),
      w,
      h,
    });
  };

  const resetCrop = () => {
    if (baseSize) setCrop({ x: 0, y: 0, w: baseSize.w, h: baseSize.h });
  };

  const createResult = async () => {
    if (!base || !crop || !file) return;
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
      const sx = Math.round(crop.x);
      const sy = Math.round(crop.y);
      const sw = Math.max(1, Math.min(Math.round(crop.w), base.width - sx));
      const sh = Math.max(1, Math.min(Math.round(crop.h), base.height - sy));
      const out = createCanvas(sw, sh);
      const ctx = get2d(out);
      if (outMime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sw, sh);
      }
      ctx.drawImage(base, sx, sy, sw, sh, 0, 0, sw, sh);
      let blob =
        outMime === "image/png"
          ? await canvasToBlob(out, "image/png")
          : await canvasToBlob(out, outMime, quality / 100);
      if (keepExif && outMime === "image/jpeg" && srcMime === "image/jpeg") {
        blob = await carryJpegExif(new Uint8Array(await file.arrayBuffer()), blob, {
          stripGps: false,
          width: sw,
          height: sh,
        });
      }
      const url = URL.createObjectURL(blob);
      setResultState((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return {
          key: cropKey,
          url,
          name: buildOutputName(file.name, "-edited", outMime),
          size: blob.size,
          w: sw,
          h: sh,
        };
      });
    } catch (e) {
      setError(t(e instanceof ImageToolError && e.message === "format-unsupported" ? "errFormat" : "errEncode"));
    } finally {
      setBusy(false);
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

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

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
      {baseResult?.failed ? (
        <p className="mt-2 text-xs text-destructive">{t("errTooLarge")}</p>
      ) : null}

      {img && baseSize && crop ? (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setRot((r) => (r + 3) % 4)}>
              {t("rotateLeft")}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setRot((r) => (r + 1) % 4)}>
              {t("rotateRight")}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setFlipH((v) => !v)}>
              {t("flipH")}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setFlipV((v) => !v)}>
              {t("flipV")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={resetCrop}>
              {t("resetCrop")}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="mr-1 text-muted-foreground">{t("aspectLabel")}</span>
            {ASPECTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => applyAspect(a.id)}
                className={`rounded-md border px-2.5 py-1 ${
                  aspectId === a.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {a.id === "free" ? t("aspectFree") : a.id}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <div
              ref={wrapRef}
              className="relative max-w-full select-none overflow-hidden rounded-md border border-border"
              style={{ touchAction: "none", width: "min(100%, 960px)" }}
              onPointerDown={(e) => onPointerDown(e)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <canvas ref={canvasRef} className="block h-auto w-full" />
              {/* 선택 영역 바깥을 어둡게 */}
              <div
                className="pointer-events-none absolute border-2 border-white"
                style={{
                  left: pct(crop.x, baseSize.w),
                  top: pct(crop.y, baseSize.h),
                  width: pct(crop.w, baseSize.w),
                  height: pct(crop.h, baseSize.h),
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                  outline: "1px solid rgba(0,0,0,0.6)",
                }}
              >
                {(["nw", "ne", "sw", "se"] as Handle[]).map((h) => (
                  <span
                    key={h}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onPointerDown(e, h);
                    }}
                    className="pointer-events-auto absolute size-4 rounded-full border-2 border-white bg-primary"
                    style={{
                      left: h.endsWith("w") ? 0 : "100%",
                      top: h.startsWith("n") ? 0 : "100%",
                      transform: "translate(-50%, -50%)",
                      cursor: h === "nw" || h === "se" ? "nwse-resize" : "nesw-resize",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {t("cropReadout", {
              w: Math.round(crop.w),
              h: Math.round(crop.h),
              total: `${baseSize.w}×${baseSize.h}`,
            })}
          </p>

          <div className="flex flex-col gap-3 rounded-lg border border-border px-3 py-3 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("outputTitle")}
            </h3>
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
            <CheckField
              label={t("keepExifLabel")}
              hint={t("keepExifHint")}
              checked={keepExif}
              onChange={setKeepExif}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={createResult} disabled={busy}>
              {busy ? t("processingButton") : t("applyButton")}
            </Button>
            {result ? (
              <a
                href={result.url}
                download={result.name}
                className="text-sm text-primary underline underline-offset-2"
              >
                {t("downloadResult", {
                  name: result.name,
                  size: formatBytes(result.size),
                  dims: `${result.w}×${result.h}`,
                })}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
