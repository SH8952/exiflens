import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL, languageAlternates } from "@/lib/seo";
import { getAllGuidesMeta } from "@/lib/guides";
import {
  BLOG_FALLBACK_LOCALE,
  BLOG_LOCALES,
  getAllBlogMeta,
  getBlogLocalesFor,
} from "@/lib/blog";
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
  "/tools/dof-hyperfocal-table",
  "/tools/sunny-16-calculator",
  "/tools/golden-hour-calculator",
  "/tools/advanced-dof-diffraction-calculator",
  "/tools/camera-fov-calculator",
  "/tools/flash-guide-number-calculator",
  "/tools/shutter-count-checker",
  // 이미지 편집·변환 도구 — status가 "live"인 것만 자동 포함 (hidden 제외)
  ...getLiveImageToolPaths(),
];

/**
 * 이미지 사이트맵용: 글 한 편에서 실제로 화면에 나오는 이미지의 원본 파일 주소를 모은다.
 * 대표 이미지(frontmatter `image`) + 본문의 마크다운 이미지 `![](/...)` +
 * 블로그 `<BlogPhoto src="/...">`. /public 에 실제 파일이 있는 것만 포함한다
 * (구글 공식 안내: `<image:loc>`만 필요, 캡션·제목 태그는 더 이상 쓰지 않음).
 * 최적화 주소(/_next/image?...)가 아닌 원본 파일 주소를 넣는다.
 */
function collectImageUrls(
  contentFile: string,
  featured: string | undefined,
): string[] | undefined {
  const paths = new Set<string>();
  if (featured) paths.add(featured);

  try {
    const raw = fs.readFileSync(contentFile, "utf8");
    for (const m of raw.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)\)/g)) paths.add(m[1]);
    for (const m of raw.matchAll(/<BlogPhoto\b[^>]*?\bsrc="(\/[^"]+)"/g)) paths.add(m[1]);
  } catch {
    // 파일을 못 읽어도 대표 이미지만으로 계속한다.
  }

  const urls = [...paths]
    .filter((p) => fs.existsSync(path.join(process.cwd(), "public", p)))
    .map((p) => `${SITE_URL}${p}`);
  return urls.length > 0 ? urls : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // lastmod must reflect real content changes, not the build/request time.
  // Home and the guide hub change when guides or blog posts are added or
  // updated, so they use the newest content date. Other static pages (legal,
  // tools, frame...) have no reliable per-page date, so lastmod is omitted
  // for them rather than reporting a misleading "modified today".
  const contentDates = [
    ...routing.locales.flatMap((locale) =>
      getAllGuidesMeta(locale as Locale).map(
        (guide) => new Date(guide.updatedAt ?? guide.publishedAt).getTime(),
      ),
    ),
    ...BLOG_LOCALES.flatMap((locale) =>
      getAllBlogMeta(locale).map((post) =>
        new Date(post.updatedAt ?? post.publishedAt).getTime(),
      ),
    ),
  ].filter((time) => !Number.isNaN(time));
  const latestContentDate =
    contentDates.length > 0 ? new Date(Math.max(...contentDates)) : undefined;

  const staticEntries = STATIC_PATHS.flatMap((path) => {
    const changeFrequency: "weekly" | "monthly" =
      path === "" || path === "/frame" || path === "/guides" ? "weekly" : "monthly";
    const priority = path === "" ? 1 : path === "/frame" ? 0.9 : path === "/guides" ? 0.7 : 0.3;

    const lastModified =
      path === "" || path === "/guides" ? latestContentDate : undefined;

    return routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      ...(lastModified ? { lastModified } : {}),
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
      images: collectImageUrls(
        path.join(process.cwd(), "content", "guides", locale, `${guide.slug}.mdx`),
        guide.image,
      ),
    })),
  );

  // 블로그는 ko·en·ja(2026-11-05). 같은 글이 공개된 언어끼리 hreflang 대체 주소로 연결한다.
  // 글이 하나도 없는 언어의 목록 페이지(noindex)는 사이트맵에서 뺀다.
  const blogEntries = BLOG_LOCALES.flatMap((blogLocale) => {
    const blogPosts = getAllBlogMeta(blogLocale);
    if (blogPosts.length === 0) return [];
    const listLanguages: Record<string, string> = Object.fromEntries(
      BLOG_LOCALES.filter((l) => getAllBlogMeta(l).length > 0).map((l) => [
        l,
        `${SITE_URL}/${l}/blog`,
      ]),
    );
    if (listLanguages[BLOG_FALLBACK_LOCALE]) {
      listLanguages["x-default"] = listLanguages[BLOG_FALLBACK_LOCALE];
    }
    return [
      {
        url: `${SITE_URL}/${blogLocale}/blog`,
        lastModified: new Date(
          blogPosts[0].updatedAt ?? blogPosts[0].publishedAt,
        ),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: { languages: listLanguages },
      },
      ...blogPosts.map((post) => {
        const languages: Record<string, string> = Object.fromEntries(
          getBlogLocalesFor(post.slug).map((l) => [
            l,
            `${SITE_URL}/${l}/blog/${post.slug}`,
          ]),
        );
        if (languages[BLOG_FALLBACK_LOCALE]) {
          languages["x-default"] = languages[BLOG_FALLBACK_LOCALE];
        }
        return {
          url: `${SITE_URL}/${blogLocale}/blog/${post.slug}`,
          lastModified: new Date(post.updatedAt ?? post.publishedAt),
          changeFrequency: "monthly" as const,
          priority: 0.6,
          alternates: { languages },
          images: collectImageUrls(
            path.join(process.cwd(), "content", "blog", blogLocale, `${post.slug}.mdx`),
            post.image,
          ),
        };
      }),
    ];
  });

  return [...staticEntries, ...guideEntries, ...blogEntries];
}
