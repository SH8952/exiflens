import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import {
  SITE_URL,
  breadcrumbJsonLd,
  ogLocale,
} from "@/lib/seo";
import {
  BLOG_LOCALE,
  compileBlogPost,
  getBlogMeta,
  getBlogSlugs,
  getRelatedBlogPosts,
  isBlogLocale,
} from "@/lib/blog";
import { GuideToolCta } from "@/components/guide-tool-cta";
import { ShareButton } from "@/components/share-button";
import { BlogPhoto } from "@/components/blog-photo";

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ locale: BLOG_LOCALE, slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isBlogLocale(locale)) return {};
  const meta = getBlogMeta(slug);
  if (!meta) return {};

  const url = `${SITE_URL}/${BLOG_LOCALE}/blog/${slug}`;
  return {
    title: meta.title,
    description: meta.description,
    // 번역본이 없으므로 hreflang 대체 주소는 달지 않는다.
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title: meta.title,
      description: meta.description,
      url,
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt ?? meta.publishedAt,
      images: meta.thumbnail
        ? [{ url: `${SITE_URL}${meta.thumbnail}`, width: 1200, height: 800 }]
        : meta.image
          ? [{ url: `${SITE_URL}${meta.image}`, width: 1600, height: 900 }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images:
        meta.thumbnail || meta.image
          ? [`${SITE_URL}${meta.thumbnail ?? meta.image}`]
          : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isBlogLocale(locale)) {
    redirect({ href: `/blog/${slug}`, locale: BLOG_LOCALE });
  }
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const tHome = await getTranslations("Home");

  const compiled = await compileBlogPost(slug);
  if (!compiled) notFound();
  const { Content, meta } = compiled;
  const relatedPosts = getRelatedBlogPosts(slug);
  const url = `${SITE_URL}/${locale}/blog/${slug}`;

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt ?? meta.publishedAt,
    author: {
      "@type": "Person",
      name: "Photographer SH",
      url: `${SITE_URL}/${locale}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "ExifLens",
    },
    mainEntityOfPage: url,
    inLanguage: locale,
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: tHome("title"), url: `${SITE_URL}/${locale}` },
    { name: t("title"), url: `${SITE_URL}/${locale}/blog` },
    { name: meta.title, url },
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <Link
        href="/blog"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t("backToBlog")}
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {meta.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {t("writtenBy")}{" "}
            <Link
              href="/about"
              rel="author"
              className="font-medium text-foreground hover:underline"
            >
              {t("authorName")}
            </Link>{" "}
            · {dateFormatter.format(new Date(meta.publishedAt))}
            {meta.updatedAt && meta.updatedAt !== meta.publishedAt
              ? ` · ${t("updatedOn", {
                  date: dateFormatter.format(new Date(meta.updatedAt)),
                })}`
              : ""}{" "}
            · {t("readingTime", { minutes: meta.readingMinutes })}
          </p>
          <ShareButton
            title={meta.title}
            text={meta.description}
            url={url}
            image={meta.image ? `${SITE_URL}${meta.image}` : undefined}
          />
        </div>
      </div>

      {meta.image ? (
        <figure className="flex flex-col gap-1.5">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image
              src={meta.image}
              alt={meta.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          {meta.imageCredit && meta.imageCreditUrl ? (
            <figcaption className="text-xs text-muted-foreground">
              Photo by{" "}
              <a
                href={meta.imageCreditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                {meta.imageCredit}
              </a>
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-a:text-primary">
        <Content components={{ BlogPhoto }} />
      </article>

      <GuideToolCta locale={locale} />

      <nav
        aria-label={t("relatedPosts")}
        className="flex flex-col gap-3 border-t border-border pt-6"
      >
        {relatedPosts.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold tracking-tight">
              {t("relatedPosts")}
            </h2>
            <ul className="flex flex-col gap-2">
              {relatedPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <Link href="/guides" className="text-sm text-primary hover:underline">
          {t("moreGuides")}
        </Link>
      </nav>
    </div>
  );
}
