import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllBlogMeta, isBlogLocale } from "@/lib/blog";
import { HomeSectionCta } from "@/components/home-section-cta";

/**
 * 홈 "최신 블로그 글" 영역 — 직접 촬영한 사진과 경험이 담긴 블로그 글 최대 3개를 썸네일 카드로 노출.
 * 블로그는 한국어 전용이라 한국어 홈에서만 보이고(다른 언어는 아무것도 그리지 않음), 글이 없으면
 * 영역 자체를 그리지 않는다. 예약 발행 글은 `getAllBlogMeta()`가 자동으로 제외한다.
 */
export async function HomeBlogHighlights({ locale }: { locale: string }) {
  if (!isBlogLocale(locale)) return null;

  const posts = getAllBlogMeta().slice(0, 3);
  if (posts.length === 0) return null;

  const t = await getTranslations("Home");
  const tBlog = await getTranslations("Blog");
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("blogHighlightsTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("blogHighlightsSubtitle")}
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-foreground/30"
            >
              {post.thumbnail ? (
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
                  <Image
                    src={post.thumbnail}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h3 className="font-semibold leading-snug tracking-tight group-hover:underline">
                  {post.title}
                </h3>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {post.description}
                </p>
                <p className="mt-auto pt-1 text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(post.publishedAt))} ·{" "}
                  {tBlog("readingTime", { minutes: post.readingMinutes })}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <HomeSectionCta href="/blog" label={t("blogHighlightsCta")} />
    </section>
  );
}
