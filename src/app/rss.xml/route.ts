import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import { getAllGuidesMeta } from "@/lib/guides";
import { BLOG_LOCALES, getAllBlogMeta } from "@/lib/blog";

// 2026-10-18 CPU 다이어트: 레이아웃이 더 이상 요청 헤더를 읽지 않아 대부분의 페이지가
// 정적으로 만들어진다. 이 페이지는 "요청 때마다" 결과가 달라지는 동작(블로그 예약 발행 날짜 판정)이
// 있어 지금까지처럼 요청마다 새로 만들도록 명시한다(동작 변경 없음).
export const dynamic = "force-dynamic";

/**
 * Site-wide RSS 2.0 feed of guide articles across every locale, submitted to
 * search-engine webmaster tools (Naver Search Advisor 등) so new/updated
 * guides get discovered faster than waiting on the crawler's own sitemap
 * revisit cadence — see the RSS discussion in
 * `claude/adsense-rejection-response-and-contact-page-handoff.md`.
 *
 * Kept as a plain hand-built XML string (no extra dependency) — the feed is
 * simple enough (title/description/link/pubDate/guid) that a package isn't
 * warranted.
 */

const MAX_ITEMS = 50;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const allItems = routing.locales.flatMap((locale) =>
    getAllGuidesMeta(locale as Locale).map((guide) => ({
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/${locale}/guides/${guide.slug}`,
      date: new Date(guide.updatedAt ?? guide.publishedAt),
      slug: guide.slug,
      locale,
    })),
  );

  // 블로그 글(ko·en·ja)도 같은 피드에 포함한다.
  for (const blogLocale of BLOG_LOCALES) {
    for (const post of getAllBlogMeta(blogLocale)) {
      allItems.push({
        title: post.title,
        description: post.description,
        url: `${SITE_URL}/${blogLocale}/blog/${post.slug}`,
        date: new Date(post.updatedAt ?? post.publishedAt),
        slug: post.slug,
        locale: blogLocale,
      });
    }
  }

  allItems.sort((a, b) => b.date.getTime() - a.date.getTime());

  const items = allItems.slice(0, MAX_ITEMS);

  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`,
    )
    .join("");

  const lastBuildDate =
    items.length > 0 ? items[0].date.toUTCString() : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ExifLens Guides</title>
    <link>${SITE_URL}</link>
    <description>ExifLens EXIF &amp; ND filter guides — new and updated articles across all languages.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // 2026-11-13 Vercel 사용량 최적화: sitemap-priority.xml 과 같이 CDN 에 1시간 캐시(예약 발행 반영 지연 최대 1시간).
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
