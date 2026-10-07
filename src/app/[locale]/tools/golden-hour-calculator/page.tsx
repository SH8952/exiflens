import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL, languageAlternates, ogLocale, breadcrumbJsonLd, DEFAULT_OG_IMAGES } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { GoldenHourCalculatorCard } from "@/components/golden-hour-calculator-card";
import { AdZone } from "@/components/ad-zone";
import { ShareButton } from "@/components/share-button";
import {
  ToolSections,
  type ToolRelated,
  type ToolSection,
} from "@/components/tools/tool-sections";
import { ToolExampleImages } from "@/components/tools/tool-example-images";
import { ToolImageDevPanel } from "@/components/dev/tool-image-dev-panel";
import { getToolImages } from "@/lib/tool-images";
import { BackLink } from "@/components/back-link";

type FaqItem = { question: string; answer: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GoldenHourCalculator" });
  const title = t("pageTitle");
  const description = t("pageDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools/golden-hour-calculator`,
      languages: languageAlternates("/tools/golden-hour-calculator"),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${locale}/tools/golden-hour-calculator`,
      images: DEFAULT_OG_IMAGES,
    },
  };
}

export default async function GoldenHourCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("GoldenHourCalculator");
  const toolsHubT = await getTranslations("ToolsHub");
  const faqs: FaqItem[] = t.raw("faq");
  const extraSections = t.raw("sections") as ToolSection[];
  const related = t.raw("related") as ToolRelated;

  const breadcrumb = breadcrumbJsonLd([
    { name: "ExifLens", url: `${SITE_URL}/${locale}` },
    { name: toolsHubT("title"), url: `${SITE_URL}/${locale}/tools` },
    {
      name: t("pageTitle"),
      url: `${SITE_URL}/${locale}/tools/golden-hour-calculator`,
    },
  ]);

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("pageTitle"),
    url: `${SITE_URL}/${locale}/tools/golden-hour-calculator`,
    applicationCategory: "PhotographyApplication",
    operatingSystem: "Any (runs in the browser)",
    description: t("pageDescription"),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    inLanguage: locale,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <BackLink to="tools" className="-mb-2" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav className="text-xs text-muted-foreground">
        <Link href="/tools" className="hover:text-foreground">
          {toolsHubT("title")}
        </Link>
        <span className="mx-1.5">/</span>
        <span>{t("pageTitle")}</span>
      </nav>

      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("pageTitle")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {t("pageDescription")}
        </p>
      </div>

      <ToolExampleImages
        slug="golden-hour-calculator"
        leftAlt={t("exampleLeftAlt")}
        rightAlt={t("exampleRightAlt")}
      />

      <GoldenHourCalculatorCard />

      <AdZone
        id="golden-hour-calculator-mid"
        label="Ad"
        size="300×250"
        className="max-w-[300px]"
      />

      <article className="flex flex-col gap-8">
        <section className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">
              {t("aboutTitle")}
            </h2>
            <ShareButton
              title={t("pageTitle")}
              text={t("pageDescription")}
              url={`${SITE_URL}/${locale}/tools/golden-hour-calculator`}
            />
          </div>
          <p>{t("aboutBody")}</p>
          <ToolSections sections={extraSections} related={related} />
          <p className="text-xs">{t("disclaimer")}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">{t("faqTitle")}</h2>
          {faqs.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-border bg-card px-4 py-3"
            >
              <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </section>
      </article>

      {process.env.NODE_ENV === "development" ? (
        <ToolImageDevPanel
          slug="golden-hour-calculator"
          left={getToolImages("golden-hour-calculator").left}
          right={getToolImages("golden-hour-calculator").right}
          defaultQuery="golden hour blue hour landscape"
        />
      ) : null}
    </div>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
