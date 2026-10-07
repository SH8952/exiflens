import { routing } from "@/i18n/routing";

/**
 * The production site URL. Set NEXT_PUBLIC_SITE_URL once the real domain
 * is purchased and pointed at Vercel — everything below (canonical URLs,
 * hreflang alternates, Open Graph, JSON-LD) derives from this one value.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://exifnd.com";

/**
 * 공유 미리보기(OG/트위터 카드) 기본 이미지. 페이지가 자기 이미지를 따로 지정하지 않으면
 * 이 이미지가 쓰인다. 페이지에서 openGraph/twitter 항목을 직접 지정하면 상위(레이아웃)의
 * 이미지가 상속되지 않으므로, 각 페이지의 openGraph/twitter에 `images`로 명시해 넣는다.
 * 파일: public/og-default.png (1200×630).
 */
export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og-default.png`,
  width: 1200,
  height: 630,
  alt: "ExifLens - EXIF viewer and ND filter calculator for photographers",
};
export const DEFAULT_OG_IMAGES = [DEFAULT_OG_IMAGE];
export const DEFAULT_TWITTER_IMAGES = [DEFAULT_OG_IMAGE.url];

const LOCALE_TO_OG: Record<(typeof routing.locales)[number], string> = {
  en: "en_US",
  ko: "ko_KR",
  es: "es_ES",
  ja: "ja_JP",
};

export function ogLocale(locale: string) {
  return LOCALE_TO_OG[locale as (typeof routing.locales)[number]] ?? "en_US";
}

/** hreflang alternates for every supported locale, plus x-default. */
export function languageAlternates(path = "") {
  const entries = routing.locales.map(
    (locale) => [locale, `${SITE_URL}/${locale}${path}`] as const,
  );
  return {
    ...Object.fromEntries(entries),
    "x-default": `${SITE_URL}/${routing.defaultLocale}${path}`,
  };
}

/** BreadcrumbList JSON-LD for search-result breadcrumb trails. */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function webApplicationJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ExifLens",
    url: `${SITE_URL}/${locale}`,
    applicationCategory: "PhotographyApplication",
    operatingSystem: "Any (runs in the browser)",
    description:
      "Drop a photo to instantly read its EXIF data and calculate the exact long exposure shutter speed for any ND filter. 100% client-side — photos never leave your browser.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    inLanguage: locale,
  };
}
