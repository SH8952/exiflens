import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { permanentRedirect } from "@/i18n/navigation";
import { SITE_URL, ogLocale, DEFAULT_OG_IMAGES } from "@/lib/seo";
import { BlogListView } from "@/components/blog-list-view";
import {
  BLOG_FALLBACK_LOCALE,
  BLOG_LOCALES,
  getAllBlogMeta,
  isBlogLocale,
} from "@/lib/blog";

// 2026-11-13 Vercel 사용량 최적화: 요청마다 만들던 방식을 1시간마다 다시 만드는 방식(ISR)으로 변경.
// 예약 발행 글은 한국 시간 자정 이후 최대 약 1시간 안에 목록에 나타난다.
export const revalidate = 3600;

/**
 * 블로그 목록 — 한국어·영어·일본어(2026-11-05). 블로그가 없는 언어(es)로 직접 접근하면
 * 영어 블로그(/en/blog)로 영구 이동한다. 세 언어 목록은 hreflang 으로 서로 연결한다.
 * 글이 하나도 없는 동안은 noindex 로 둬서 빈 목록 페이지가 얇은 콘텐츠로 색인되는 것을 막는다.
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
  const hasPosts = getAllBlogMeta(locale).length > 0;

  return {
    title,
    description,
    robots: hasPosts ? undefined : { index: false, follow: true },
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog`,
      languages: {
        ...Object.fromEntries(
          BLOG_LOCALES.map((l) => [l, `${SITE_URL}/${l}/blog`]),
        ),
        "x-default": `${SITE_URL}/${BLOG_FALLBACK_LOCALE}/blog`,
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${locale}/blog`,
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
    permanentRedirect({ href: "/blog", locale: BLOG_FALLBACK_LOCALE });
  }
  setRequestLocale(locale);
  return <BlogListView locale={locale} page={1} />;
}

export function generateStaticParams() {
  return BLOG_LOCALES.map((locale) => ({ locale }));
}
