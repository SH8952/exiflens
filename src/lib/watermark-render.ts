/**
 * 워터마크 그리기 — 미리보기와 실제 저장에서 같은 함수를 쓴다.
 * 모든 크기는 이미지 가로폭 대비 비율이라 해상도가 달라도 같은 모양이 나온다.
 */
export type WatermarkPosition =
  | "tl" | "tc" | "tr"
  | "ml" | "mc" | "mr"
  | "bl" | "bc" | "br"
  | "tile";

export type WatermarkOptions = {
  type: "text" | "image";
  text: string;
  color: string;
  /** 글자 크기 또는 로고 가로폭 (이미지 가로폭의 %) */
  sizePct: number;
  /** 0~1 */
  opacity: number;
  position: WatermarkPosition;
  /** 가장자리 여백 (이미지 가로폭의 %) */
  marginPct: number;
  /** -45 ~ 45 */
  angle: number;
  shadow: boolean;
};

const FONT_STACK =
  "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',Arial,Helvetica,sans-serif";

export function renderWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: WatermarkOptions,
  logo: CanvasImageSource | null,
  logoSize: { w: number; h: number } | null,
): void {
  let itemW = 0;
  let itemH = 0;
  const fontPx = Math.max(6, (w * opts.sizePct) / 100);

  if (opts.type === "text") {
    if (!opts.text.trim()) return;
    ctx.font = `bold ${fontPx}px ${FONT_STACK}`;
    itemW = ctx.measureText(opts.text).width;
    itemH = fontPx;
  } else {
    if (!logo || !logoSize) return;
    itemW = Math.max(4, (w * opts.sizePct) / 100);
    itemH = itemW * (logoSize.h / logoSize.w);
  }

  const draw = () => {
    if (opts.type === "text") {
      ctx.font = `bold ${fontPx}px ${FONT_STACK}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = opts.color;
      if (opts.shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = fontPx * 0.12;
        ctx.shadowOffsetX = fontPx * 0.03;
        ctx.shadowOffsetY = fontPx * 0.03;
      }
      ctx.fillText(opts.text, 0, 0);
    } else if (logo) {
      if (opts.shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = itemW * 0.04;
      }
      ctx.drawImage(logo, -itemW / 2, -itemH / 2, itemW, itemH);
    }
  };

  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, opts.opacity));
  const rad = (opts.angle * Math.PI) / 180;

  if (opts.position === "tile") {
    const stepX = itemW * 1.8;
    const stepY = itemH * 3;
    const diag = Math.hypot(w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rad);
    let row = 0;
    for (let y = -diag / 2; y <= diag / 2; y += stepY, row++) {
      const offset = row % 2 === 0 ? 0 : stepX / 2;
      for (let x = -diag / 2 - stepX; x <= diag / 2 + stepX; x += stepX) {
        ctx.save();
        ctx.translate(x + offset, y);
        draw();
        ctx.restore();
      }
    }
  } else {
    const margin = (w * opts.marginPct) / 100;
    const col = opts.position[1]; // l | c | r  (tl→"l")
    const rowKey = opts.position[0]; // t | m | b
    const hAlign = opts.position === "tc" || opts.position === "mc" || opts.position === "bc" ? "c" : col;
    const cx =
      hAlign === "l" ? margin + itemW / 2 : hAlign === "r" ? w - margin - itemW / 2 : w / 2;
    const cy =
      rowKey === "t" ? margin + itemH / 2 : rowKey === "b" ? h - margin - itemH / 2 : h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(rad);
    draw();
  }
  ctx.restore();
}
