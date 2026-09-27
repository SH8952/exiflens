import { defineRouting } from "next-intl/routing";

export const locales = ["en", "es", "ja", "ko"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  ja: "JA",
  ko: "KO",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
  // SEO: don't auto-redirect "/" based on the visitor's Accept-Language
  // header. Google explicitly advises against content-negotiation-based
  // redirects for locale selection, since the redirect target then varies
  // per visitor/bot instead of being a single deterministic URL. With this
  // off, "/" always redirects to defaultLocale ("en") for everyone,
  // including Googlebot; the in-site language switcher (which links to
  // locale-prefixed URLs directly) is unaffected.
  localeDetection: false,
});
