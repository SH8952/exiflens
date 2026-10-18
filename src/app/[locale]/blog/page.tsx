import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { permanentRedirect } from "@/i18n/navigation";
import { SITE_URL, ogLocale, DEFAULT_OG_IMAGES } from "@/lib/seo";
import { BlogListView } from "@/components/blog-list-view";
import { BLOG_LOCALE, getAllBlogMeta, isBlogLocale } from "@/lib/blog";

// 2026-10-18 CPU 다이어트: 레이아웃이 더 이상 요청 헤더를 읽지 않아 대부분의 페이지가
// 정적으로 만들어진다. 이 페이지는 "요청 때마다" 결과가 달라지는 동작(블로그 예약 발행 날짜 판정)이
// 있어 지금까지처럼 요청마다 새로 만들도록 명시한다(동작 변경 없음).
export const dynamic = "force-dynamic";

/**
 * 블로그 목록 — 한국어 전용(/ko/blog). 다른 언어로 직접 접근하면 /ko/blog 로
 * 리디렉션한다(헤더 메뉴는 처음부터 /ko/blog 로 연결). hreflang 대체 주소는
 * 달지 않는다(번역본이 없으므로). 글이 하나도 없는 동안은 noindex 로 둬서
 * 빈 목록 페이지가 얇은 콘텐츠로 색인되는 것을 막는다.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isBlogLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "Blog" });
  const title = t("title");
  const description = t("subtitle");
  const hasPosts = getAllBlogMeta().length > 0;

  return {
    title,
    description,
    robots: hasPosts ? undefined : { index: false, follow: true },
    alternates: {
      canonical: `${SITE_URL}/${BLOG_LOCALE}/blog`,
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${BLOG_LOCALE}/blog`,
      images: DEFAULT_OG_IMAGES,
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isBlogLocale(locale)) {
    permanentRedirect({ href: "/blog", locale: BLOG_LOCALE });
  }
  setRequestLocale(locale);
  return <BlogListView locale={locale} page={1} />;
}

export function generateStaticParams() {
  return [{ locale: BLOG_LOCALE }];
}
