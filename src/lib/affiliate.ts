export type AffiliateProvider = "coupang" | "amazon" | null;

/**
 * Decides which affiliate program to show, mixing two signals:
 *  1. The visitor's real country, when Vercel's edge provides one (see
 *     src/proxy.ts, which copies `x-vercel-ip-country` into the
 *     `geo-country` cookie).
 *  2. A fallback based on the UI language, for local dev / non-Vercel
 *     hosting / when no geo signal is available yet.
 *
 * This is a plain, dependency-free function (no next/headers) so it can be
 * called from a Client Component — resolving it client-side (reading the
 * cookie in the browser) keeps the main page fully static/SSG instead of
 * opting the whole route into per-request dynamic rendering, which is what
 * happens if a Server Component reads cookies() here instead.
 *
 * Coupang Partners is wired up now. Amazon Associates is not set up yet,
 * so every non-Korea case resolves to null (the UI hides the section)
 * until a real Associate tag is added.
 */
export function resolveAffiliateProvider(
  locale: string,
  geoCountry: string | null,
): AffiliateProvider {
  if (geoCountry) {
    return geoCountry === "KR" ? "coupang" : amazonForCountry();
  }
  return locale === "ko" ? "coupang" : amazonForLocale();
}

// TODO: once an Amazon Associates tag exists, map country -> Amazon
// domain + tag here (e.g. US -> amazon.com, JP -> amazon.co.jp).
function amazonForCountry(): AffiliateProvider {
  return null;
}

// TODO: same mapping as amazonForCountry, keyed by UI locale instead.
function amazonForLocale(): AffiliateProvider {
  return null;
}
