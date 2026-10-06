"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { GuideHeading } from "@/lib/guides";

/**
 * 가이드 "리모컨" 목차: 스크롤해도 화면에 고정되어 따라다니는 목차.
 * - 넓은 화면(xl, 1280px~): 본문 오른쪽 여백에 고정 패널 + 현재 위치 강조
 * - 좁은 화면: 오른쪽 아래 작은 버튼 → 누르면 목록이 열리고, 항목 선택 시 이동 후 닫힘
 * 상단의 펼쳐진 정적 목차(GuideToc)는 그대로 두고, 이 컴포넌트는 이동 편의용이다.
 * 소제목이 2개 미만이면 그리지 않는다.
 */
export function GuideFloatingToc({ headings }: { headings: GuideHeading[] }) {
  const t = useTranslations("Guides");
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (headings.length < 2) return;

    const update = () => {
      setVisible(window.scrollY > 480);
      // 화면 위쪽 1/4 지점을 지난 마지막 소제목을 현재 위치로 본다
      const line = window.innerHeight * 0.25;
      let current: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = h.id;
        else break;
      }
      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headings]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (headings.length < 2) return null;

  const list = (
    <ol className="flex flex-col gap-0.5 text-xs">
      {headings.map((heading, index) => {
        const active = heading.id === activeId;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={() => setOpen(false)}
              aria-current={active ? "location" : undefined}
              className={`flex items-baseline gap-1.5 rounded border-l-2 px-2 py-1 leading-snug transition-colors ${
                active
                  ? "border-primary bg-primary/10 font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="w-5 shrink-0 text-right tabular-nums">
                {index + 1}.
              </span>
              <span className="line-clamp-2 min-w-0 flex-1">{heading.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      {/* 넓은 화면: 본문(max-w-3xl) 오른쪽 여백에 고정 */}
      <nav
        aria-label={t("toc")}
        className={`fixed top-24 z-30 hidden max-h-[calc(100vh-8rem)] w-56 overflow-y-auto rounded-lg border border-border bg-background/90 p-3 shadow-sm backdrop-blur transition-opacity motion-reduce:transition-none xl:block ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ left: "calc(50% + 24rem + 1.5rem)" }}
      >
        <p className="mb-2 px-2 text-xs font-semibold tracking-tight">
          {t("toc")}
        </p>
        {list}
      </nav>

      {/* 좁은 화면: 오른쪽 아래 버튼 + 펼침 패널 */}
      <div className="contents xl:hidden">
        {open ? (
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        ) : null}
        <div
          className={`fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 transition-opacity motion-reduce:transition-none ${
            visible || open ? "" : "pointer-events-none opacity-0"
          }`}
        >
          {open ? (
            <nav
              aria-label={t("toc")}
              className="max-h-[60vh] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border border-border bg-background p-3 shadow-lg"
            >
              {list}
            </nav>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold shadow-md hover:bg-muted"
          >
            {open ? "✕" : "☰"} {t("toc")}
          </button>
        </div>
      </div>
    </>
  );
}
