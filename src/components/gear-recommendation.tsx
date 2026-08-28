"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { resolveAffiliateProvider } from "@/lib/affiliate";
import { CoupangGearCards } from "@/components/coupang-gear-cards";

function readGeoCountryCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )geo-country=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function subscribeNever() {
  // The geo-country cookie doesn't change during a page's lifetime, so
  // there's nothing to subscribe to — this just satisfies
  // useSyncExternalStore's API.
  return () => {};
}

function getServerSnapshot(): "pending" {
  return "pending";
}

/**
 * Client-side wrapper that decides which affiliate provider to show.
 *
 * This resolution intentionally happens in the browser (reading the
 * `geo-country` cookie set by src/proxy.ts) rather than in a Server
 * Component reading cookies() during render. Reading cookies() in a
 * Server Component would opt the entire page out of static generation
 * (Next.js marks the whole route as dynamic), which would undo the
 * SSG/SEO benefit the site is built for. Since the gear section is
 * already a client-fetched, progressively-enhanced block (see
 * CoupangGearCards), resolving the provider here has no real UX cost:
 * it just renders the same loading skeleton for one extra tick.
 */
export function GearRecommendation({ locale }: { locale: string }) {
  const t = useTranslations("Home");

  // Reading document.cookie must not happen during server rendering (it
  // would either throw or, worse, silently diverge from the client's
  // first paint). useSyncExternalStore is the React-sanctioned way to read
  // a browser-only value like this: it renders the server snapshot
  // ("pending") during SSR/prerender and hydration, then re-renders with
  // the real client value right after mount — no manual effect+setState
  // needed.
  const provider = React.useSyncExternalStore(
    subscribeNever,
    () => resolveAffiliateProvider(locale, readGeoCountryCookie()),
    getServerSnapshot,
  );

  if (provider === "pending") {
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

  if (provider === "coupang") {
    return <CoupangGearCards />;
  }

  return <p className="text-sm text-muted-foreground">{t("gearSectionHint")}</p>;
}
