"use client";

import { useEffect, useRef } from "react";

/**
 * 가이드 본문 읽기 진행 표시: 화면 맨 위에 얇은 막대가 본문(targetId)을 읽은 만큼 채워진다.
 * - 본문 맨 위가 화면 위쪽에 닿을 때 0%, 본문 끝이 화면 아래쪽에 닿을 때 100%
 * - 스크롤 때 React를 다시 그리지 않고 막대의 scaleX만 바꿔 가볍다(requestAnimationFrame으로 묶음)
 * - 장식용이라 스크린리더에서는 숨기고, 모션 줄이기 설정에서는 애니메이션 없이 즉시 반영한다
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const target = document.getElementById(targetId);
    if (!bar || !target) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress =
        scrollable <= 0
          ? rect.top <= 0
            ? 1
            : 0
          : Math.min(1, Math.max(0, -rect.top / scrollable));
      bar.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-primary"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
