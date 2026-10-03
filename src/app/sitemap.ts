import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL, languageAlternates } from "@/lib/seo";
import { getAllGuidesMeta } from "@/lib/guides";
import { BLOG_LOCALE, getAllBlogMeta } from "@/lib/blog";
import { getLiveImageToolPaths } from "@/lib/tools-roster";

/**
 * Every static route currently in the app, per Google AdSense/SEO checklist
 * item 3 ("Google Search Console 인덱싱: sitemap.xml 제출"). `/guides` was
 * added once that route shipped (Phase 3) — individual articles are listed
 * separately below since each locale can have a different set of slugs.
 */
const STATIC_PATHS = [
  "",
  "/frame",
  "/privacy",
  "/terms",
  "/about",
  "/disclosure",
  "/contact",
  "/guides",
  "/faq",
  "/tools",
  "/tools/dof-calculator",
  "/tools/exposure-stops-calculator",
  "/tools/timelapse-calculator",
  "/tools/astrophotography-calculator",
  "/tools/bracketing-calculator",
  "/tools/print-resolution-calculator",
  "/tools/storage-calculator",
  "/tools/exif-remover",
  "/tools/crop-factor-calculator",
  // 이미지 편집·변환 도구 — status가 "live"인 것만 자동 포함 (hidden 제외)
  ...getLiveImageToolPaths(),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries = STATIC_PATHS.flatMap((path) => {
    const changeFrequency: "weekly" | "monthly" =
      path === "" || path === "/frame" || path === "/guides" ? "weekly" : "monthly";
    const priority = path === "" ? 1 : path === "/frame" ? 0.9 : path === "/guides" ? 0.7 : 0.3;

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

  const guideEntries = routing.locales.flatMap((locale) =>
    getAllGuidesMeta(locale as Locale).map((guide) => ({
      url: `${SITE_URL}/${locale}/guides/${guide.slug}`,
      lastModified: new Date(guide.updatedAt ?? guide.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: languageAlternates(`/guides/${guide.slug}`),
      },
    })),
  );

  // 블로그는 한국어 전용 — 번역본이 없으므로 hreflang 대체 주소(alternates)는 달지
  // 않는다. 글이 하나도 없는 동안은 목록 페이지(noindex)도 사이트맵에서 뺀다.
  const blogPosts = getAllBlogMeta();
  const blogEntries =
    blogPosts.length === 0
      ? []
      : [
          {
            url: `${SITE_URL}/${BLOG_LOCALE}/blog`,
            lastModified: new Date(
              blogPosts[0].updatedAt ?? blogPosts[0].publishedAt,
            ),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          },
          ...blogPosts.map((post) => ({
            url: `${SITE_URL}/${BLOG_LOCALE}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt ?? post.publishedAt),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          })),
        ];

  return [...staticEntries, ...guideEntries, ...blogEntries];
}
