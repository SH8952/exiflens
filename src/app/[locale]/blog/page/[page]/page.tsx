import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL, ogLocale, DEFAULT_OG_IMAGES } from "@/lib/seo";
import { BLOG_LOCALE, getBlogPage, isBlogLocale } from "@/lib/blog";
import { BlogListView } from "@/components/blog-list-view";

/**
 * 블로그 목록 2페이지 이후(/ko/blog/page/2 …). 1페이지는 /ko/blog.
 * 글이 BLOG_PAGE_SIZE(12)개를 넘어야 2페이지가 생기며, 그 전에는 모든 주소가 404 다.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  const { totalPages } = getBlogPage(1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    locale: BLOG_LOCALE,
    page: String(i + 2),
  }));
}

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  const { totalPages } = getBlogPage(1);
  return n >= 2 && n <= totalPages ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; page: string }>;
}): Promise<Metadata> {
  const { locale, page: rawPage } = await params;
  const page = parsePage(rawPage);
  if (!isBlogLocale(locale) || page === null) return {};
  const t = await getTranslations({ locale, namespace: "Blog" });
  const title = `${t("title")} · ${t("pageLabel", { page })}`;
  const url = `${SITE_URL}/${BLOG_LOCALE}/blog/page/${page}`;
  return {
    title,
    description: t("subtitle"),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description: t("subtitle"),
      url,
      images: DEFAULT_OG_IMAGES,
    },
  };
}

export default async function BlogPagedPage({
  params,
}: {
  params: Promise<{ locale: string; page: string }>;
}) {
  const { locale, page: rawPage } = await params;
  const page = parsePage(rawPage);
  if (!isBlogLocale(locale) || page === null) notFound();
  setRequestLocale(locale);
  return <BlogListView locale={locale} page={page} />;
}
