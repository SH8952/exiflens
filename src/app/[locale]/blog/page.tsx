import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import {
  SITE_URL,
  breadcrumbJsonLd,
  ogLocale,
} from "@/lib/seo";
import { BLOG_LOCALE, getAllBlogMeta, isBlogLocale } from "@/lib/blog";

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
    redirect({ href: "/blog", locale: BLOG_LOCALE });
  }
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const tHome = await getTranslations("Home");
  const posts = getAllBlogMeta();

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const breadcrumbs = breadcrumbJsonLd([
    { name: tHome("title"), url: `${SITE_URL}/${locale}` },
    { name: t("title"), url: `${SITE_URL}/${locale}/blog` },
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <h2 className="text-lg font-semibold tracking-tight">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {post.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(post.publishedAt))} ·{" "}
                  {t("readingTime", { minutes: post.readingMinutes })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function generateStaticParams() {
  return [{ locale: BLOG_LOCALE }];
}
