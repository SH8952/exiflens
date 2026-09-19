"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useNdCalculatorStore } from "@/store/nd-calculator-store";
import type { CoupangProduct } from "@/lib/coupang";

type FetchState =
  | { status: "empty"; filterId: string }
  | { status: "error"; filterId: string }
  | { status: "ok"; filterId: string; products: CoupangProduct[] };

/**
 * initialProducts: 2026-09-19 추가 (AdSense 재심사 대응). 부모 서버
 * 컴포넌트가 useNdCalculatorStore의 기본 filterId("nd1000")와
 * 무관한 공통 키워드로 미리 조회해둔 실제 상품
 * (src/lib/gear-recommendation-ssr.ts)이 있으면 초기 상태로 그것부터
 * 보여주고(/api/coupang/search는 filter 파라미터를 읽지 않으므로
 * 어느 filterId에서도 같은 결과가 나온다), 마운트 후 기존처럼
 * 개인화(다수 키워드 혼합) 결과로 자연스럽게 교체한다.
 * useNdCalculatorStore의 기본 filterId가 "nd1000"이므로, 초기 마운트
 * 시점에는 이 값과 일치해 그상태(skeleton)가 보이지 않는다.
 */
export function CoupangGearCards({
  initialProducts,
}: {
  initialProducts?: CoupangProduct[];
}) {
  const t = useTranslations("Home");
  const filterId = useNdCalculatorStore((s) => s.filterId);
  const [state, setState] = React.useState<FetchState | null>(() =>
    initialProducts && initialProducts.length > 0
      ? { status: "ok", filterId: "nd1000", products: initialProducts }
      : null,
  );

  React.useEffect(() => {
    let cancelled = false;

    fetch(`/api/coupang/search?filter=${encodeURIComponent(filterId)}`)
      .then((res) => res.json())
      .then((data: { products?: CoupangProduct[] }) => {
        if (cancelled) return;
        const products = data.products ?? [];
        if (products.length > 0) {
          setState({ status: "ok", filterId, products });
        } else if (!initialProducts || initialProducts.length === 0) {
          setState({ status: "empty", filterId });
        }
      })
      .catch(() => {
        if (!cancelled && (!initialProducts || initialProducts.length === 0)) {
          setState({ status: "error", filterId });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterId]);

  // Still loading if we have no result yet, or the result on hand belongs
  // to a previous filterId (a new fetch just kicked off above) — unless
  // that stale-looking state is actually the server-seeded initialProducts
  // for the default filterId, which is safe to keep showing.
  if (state === null || (state.filterId !== filterId && state.filterId !== "nd1000")) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (state.status === "empty" || state.status === "error") {
    return <p className="text-sm text-muted-foreground">{t("gearSectionHint")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {state.products.map((product) => (
          <a
            key={product.productId}
            href={product.productUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="group flex flex-col gap-2 rounded-lg border border-border bg-background p-2 transition-colors hover:border-primary/50"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
              <Image
                src={product.productImage}
                alt={product.productName}
                fill
                sizes="(min-width: 640px) 20vw, 45vw"
                className="object-cover transition-transform group-hover:scale-105"
                unoptimized
              />
            </div>
            <p className="line-clamp-2 text-xs text-foreground">
              {product.productName}
            </p>
            <p className="text-sm font-semibold text-primary">
              {product.productPrice.toLocaleString()}원
            </p>
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t("gearDisclosure")}</p>
    </div>
  );
}
