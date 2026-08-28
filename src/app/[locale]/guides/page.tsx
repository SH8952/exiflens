import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL, languageAlternates, ogLocale } from "@/lib/seo";
import { getAllGuidesMeta } from "@/lib/guides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Guides" });
  const title = t("title");
  const description = t("subtitle");

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/guides`,
      languages: languageAlternates("/guides"),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${locale}/guides`,
    },
  };
}

// Known categories are shown first, in this order; any category text that
// doesn't match one of these (e.g. a new category introduced by a future
// automated guide) is grouped afterwards, ordered by how recently its
// newest guide was published. This list only needs the categories we've
// coined so far — it's just a display-order preference, not a whitelist.
const PREFERRED_CATEGORY_ORDER = [
  "Camera Basics & Exposure",
  "카메라 기초 & 노출",
  "カメラ基礎と露出",
  "Fundamentos de cámara y exposición",
  "ND Filters & Long Exposure",
  "ND 필터 & 장노출",
  "NDフィルターと長秒露光",
  "Filtros ND y exposición larga",
  "Photography Genres",
  "장르별 촬영 가이드",
  "ジャンル別撮影ガイド",
  "Guías por género fotográfico",
  "EXIF & Sharing",
  "EXIF 활용 & 공유",
  "EXIF活用と共有",
  "EXIF y compartir",
];

function groupGuidesByCategory(
  guides: ReturnType<typeof getAllGuidesMeta>,
  fallbackLabel: string,
) {
  const groups = new Map<string, typeof guides>();

  for (const guide of guides) {
    const category = guide.category?.trim() || fallbackLabel;
    const existing = groups.get(category);
    if (existing) {
      existing.push(guide);
    } else {
      groups.set(category, [guide]);
    }
  }

  // guides is already sorted newest-first, so the first guide pushed into
  // each group is that group's most recent guide — use that for ordering
  // categories not in PREFERRED_CATEGORY_ORDER.
  return Array.from(groups.entries()).sort(([aLabel, aGuides], [bLabel, bGuides]) => {
    const aIndex = PREFERRED_CATEGORY_ORDER.indexOf(aLabel);
    const bIndex = PREFERRED_CATEGORY_ORDER.indexOf(bLabel);
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
    }
    return aGuides[0].publishedAt < bGuides[0].publishedAt ? 1 : -1;
  });
}

export default async function GuidesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Guides");
  const guides = getAllGuidesMeta(locale as Locale);
  const categoryGroups = groupGuidesByCategory(guides, t("otherCategory"));

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {guides.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {categoryGroups.map(([category, categoryGuides]) => (
            <section key={category} className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold tracking-tight">
                {category}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {categoryGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <h3 className="text-lg font-semibold tracking-tight">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {guide.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(guide.publishedAt))} ·{" "}
                      {t("readingTime", { minutes: guide.readingMinutes })}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
