"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export interface GuideCategoryItem {
  slug: string;
  title: string;
  description: string;
  dateLabel: string;
  /** 대표 이미지 경로(없으면 이미지 영역 없이 텍스트 카드로 표시). */
  image?: string;
  imageAlt?: string;
}

// Runs before the browser paints on the client (so a restored "expanded"
// state never flashes as collapsed first), but falls back to useEffect on the
// server where useLayoutEffect isn't available.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Remembers which category sections the visitor expanded, for this browser
// tab only (sessionStorage), so pressing Back from a guide returns to the
// same expanded list instead of resetting to the collapsed one.
const EXPANDED_STORAGE_PREFIX = "guides-expanded:";

interface GuideCategorySectionProps {
  categoryLabel: string;
  items: GuideCategoryItem[];
  expandLabel: string;
  collapseLabel: string;
  initialVisibleCount?: number;
  /** 첫 화면에 보이는 섹션이면 상단 카드 이미지를 우선 로딩한다. */
  prioritizeImages?: boolean;
}

export function GuideCategorySection({
  categoryLabel,
  items,
  expandLabel,
  collapseLabel,
  initialVisibleCount = 4,
  prioritizeImages = false,
}: GuideCategorySectionProps) {
  const storageKey = `${EXPANDED_STORAGE_PREFIX}${categoryLabel}`;
  const [expanded, setExpanded] = useState(false);

  useIsomorphicLayoutEffect(() => {
    try {
      if (window.sessionStorage.getItem(storageKey) === "1") {
        setExpanded(true);
      }
    } catch {
      // sessionStorage unavailable (private mode etc.) — stay collapsed.
    }
  }, [storageKey]);

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    try {
      if (next) {
        window.sessionStorage.setItem(storageKey, "1");
      } else {
        window.sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore storage errors — the toggle still works for this visit.
    }
  };
  const hasMore = items.length > initialVisibleCount;
  // 모든 카드를 처음부터 HTML에 넣어 두고(검색 로봇이 링크를 모두 볼 수 있도록),
  // 접힌 상태에서는 initialVisibleCount 이후 카드만 화면에서 숨긴다(2026-10-09).
  // 숨긴 카드의 이미지는 lazy 로딩이라 접힌 동안 내려받지 않는다.

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">{categoryLabel}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <Link
            key={item.slug}
            href={`/guides/${item.slug}`}
            className={`group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40${
              !expanded && index >= initialVisibleCount ? " hidden" : ""
            }`}
          >
            {item.image ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted max-sm:aspect-[2/1]">
                <Image
                  src={item.image}
                  alt={item.imageAlt ?? item.title}
                  fill
                  sizes="(min-width: 1024px) 512px, (min-width: 640px) 50vw, 100vw"
                  priority={prioritizeImages && index < 2}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-1 p-5">
              <h3 className="text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.dateLabel}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {hasMore ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-center"
          onClick={toggleExpanded}
        >
          {expanded ? collapseLabel : expandLabel}
        </Button>
      ) : null}
    </section>
  );
}
