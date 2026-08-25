import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, languageAlternates } from "@/lib/seo";

/**
 * Every static route currently in the app, per Google AdSense/SEO checklist
 * item 3 ("Google Search Console 인덱싱: sitemap.xml 제출"). `/guides` and
 * its articles are added here once that route ships (Phase 3/4) — listing
 * a path that 404s would be worse than omitting it.
 */
const STATIC_PATHS = ["", "/frame", "/privacy", "/terms", "/about", "/disclosure"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return STATIC_PATHS.flatMap((path) => {
    const changeFrequency: "weekly" | "monthly" =
      path === "" || path === "/frame" ? "weekly" : "monthly";
    const priority = path === "" ? 1 : path === "/frame" ? 0.9 : 0.3;

    return routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: languageAlternates(path),
      },
    }));
  });
}
