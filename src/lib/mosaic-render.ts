/**
 * 모자이크/블러/가림 처리 — 미리보기와 저장에서 같은 함수를 쓴다.
 * 영역 크기에 비례해 처리하므로 해상도가 달라도 "읽을 수 없는 정도"가 같다.
 */
export type MosaicShape = "rect" | "ellipse";
export type MosaicEffect = "pixelate" | "blur" | "black";

export type MosaicRegion = {
  /** 원본 이미지 좌표(px) */
  x: number;
  y: number;
  w: number;
  h: number;
  shape: MosaicShape;
};

/** strength 1(약함)~10(강함) → 짧은 변을 몇 칸으로 나눌지 */
function cellsFor(strength: number): number {
  return Math.max(3, 24 - Math.round(strength) * 2);
}

export function renderMosaic(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  outW: number,
  outH: number,
  regions: MosaicRegion[],
  effect: MosaicEffect,
  strength: number,
): void {
  ctx.save();
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, outW, outH);
  ctx.restore();

  const scale = outW / srcW;
  for (const r of regions) {
    const rx = r.x * scale;
    const ry = r.y * scale;
    const rw = r.w * scale;
    const rh = r.h * scale;
    if (rw < 1 || rh < 1) continue;

    ctx.save();
    ctx.beginPath();
    if (r.shape === "ellipse") {
      ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
    } else {
      ctx.rect(rx, ry, rw, rh);
    }
    ctx.clip();

    if (effect === "black") {
      ctx.fillStyle = "#000";
      ctx.fillRect(rx, ry, rw, rh);
    } else {
      const cells = cellsFor(strength);
      const block = Math.max(1, Math.min(rw, rh) / cells);
      const tw = Math.max(1, Math.round(rw / block));
      const th = Math.max(1, Math.round(rh / block));
      const tmp = document.createElement("canvas");
      tmp.width = tw;
      tmp.height = th;
      const tctx = tmp.getContext("2d");
      if (tctx) {
        tctx.imageSmoothingQuality = "high";
        // 원본에서 해당 영역만 작게 줄여 평균 색을 얻는다
        tctx.drawImage(source, r.x, r.y, r.w, r.h, 0, 0, tw, th);
        ctx.imageSmoothingEnabled = effect === "blur";
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(tmp, 0, 0, tw, th, rx, ry, rw, rh);
      }
    }
    ctx.restore();
  }
}
