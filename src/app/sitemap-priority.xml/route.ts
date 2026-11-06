import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import { BLOG_LOCALE, BLOG_LOCALES, getAllBlogMeta } from "@/lib/blog";

/**
 * 우선순위 사이트맵 (/sitemap-priority.xml).
 *
 * 전체 사이트맵(/sitemap.xml)은 그대로 두고, 검색 수요가 분명한 핵심 페이지만
 * 따로 모은 보조 사이트맵이다. 구글 서치 콘솔에 별도로 제출하면 이 사이트맵에
 * 속한 주소의 발견·색인 수를 따로 추적할 수 있다.
 *
 * - 홈·도구 허브·가이드 허브·핵심 도구 8종: 4개 언어 전부
 * - 블로그 목록: 글이 있는 언어(ko·en·ja)
 * - 블로그 글: 한국어 원문 전체(날짜는 frontmatter의 실제 값만 lastmod로 사용)
 * 전체 사이트맵과 주소가 겹쳐도 중복 문제는 없다.
 */
// rss.xml 과 같은 방식: 블로그 예약 발행(미래 날짜 글 숨김)이 "요청 시점" 기준이므로
// 요청마다 계산하고, 응답은 아래 Cache-Control 로 CDN 에 1시간 캐시한다.
export const dynamic = "force-dynamic";

const PRIORITY_PATHS = [
  "",
  "/tools",
  "/guides",
  "/tools/shutter-count-checker",
  "/tools/exif-remover",
  "/tools/crop-factor-calculator",
  "/tools/dof-calculator",
  "/tools/camera-fov-calculator",
  "/tools/golden-hour-calculator",
  "/tools/astrophotography-calculator",
  "/tools/print-resolution-calculator",
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function urlEntry(loc: string, lastmod?: Date): string {
  const lastmodTag =
    lastmod && !Number.isNaN(lastmod.getTime())
      ? `<lastmod>${lastmod.toISOString()}</lastmod>`
      : "";
  return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`;
}

export function GET(): Response {
  const entries: string[] = [];

  for (const locale of routing.locales) {
    for (const path of PRIORITY_PATHS) {
      entries.push(urlEntry(`${SITE_URL}/${locale}${path}`));
    }
  }

  for (const locale of BLOG_LOCALES) {
    const posts = getAllBlogMeta(locale);
    if (posts.length === 0) continue;
    entries.push(
      urlEntry(
        `${SITE_URL}/${locale}/blog`,
        new Date(posts[0].updatedAt ?? posts[0].publishedAt),
      ),
    );
  }

  for (const post of getAllBlogMeta(BLOG_LOCALE)) {
    entries.push(
      urlEntry(
        `${SITE_URL}/${BLOG_LOCALE}/blog/${post.slug}`,
        new Date(post.updatedAt ?? post.publishedAt),
      ),
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join("\n") +
    `\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
