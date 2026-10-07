import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import { getBlogPage } from "@/lib/blog";
import { BackLink } from "@/components/back-link";

/**
 * 블로그 목록(1페이지·2페이지 이후 공용) — 2026-10-02.
 * PC 기준 한 줄 4개 카드(모바일 1 → sm 2 → lg 3 → xl 4), 카드 상단 썸네일.
 * 글이 BLOG_PAGE_SIZE(12)개를 넘으면 하단에 1, 2, 3… 페이지 번호가 나온다.
 */
export async function BlogListView({
  locale,
  page,
}: {
  locale: string;
  page: number;
}) {
  const t = await getTranslations("Blog");
  const tHome = await getTranslations("Home");
  const { posts, totalPages } = getBlogPage(page);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const breadcrumbs = breadcrumbJsonLd([
    { name: tHome("title"), url: `${SITE_URL}/${locale}` },
    { name: t("title"), url: `${SITE_URL}/${locale}/blog` },
  ]);

  const pageHref = (n: number) => (n === 1 ? "/blog" : `/blog/page/${n}`);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10">
      <BackLink to="home" className="-mb-4" />
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
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
              >
                {post.thumbnail ? (
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      priority={index < 4}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <h2 className="text-base font-semibold leading-snug tracking-tight">
                    {post.title}
                  </h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                  <p className="mt-auto pt-1 text-xs text-muted-foreground">
                    {dateFormatter.format(new Date(post.publishedAt))} ·{" "}
                    {t("readingTime", { minutes: post.readingMinutes })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label={t("pagination")}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
            n === page ? (
              <span
                key={n}
                aria-current="page"
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
              >
                {n}
              </span>
            ) : (
              <Link
                key={n}
                href={pageHref(n)}
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border px-3 text-sm transition-colors hover:border-primary/50"
              >
                {n}
              </Link>
            ),
          )}
        </nav>
      ) : null}
    </div>
  );
}
