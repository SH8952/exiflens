import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL, languageAlternates, ogLocale, breadcrumbJsonLd } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { BracketCalculatorCard } from "@/components/bracket-calculator-card";
import { ToolExampleImages } from "@/components/tools/tool-example-images";
import { ToolImageDevPanel } from "@/components/dev/tool-image-dev-panel";
import { getToolImages } from "@/lib/tool-images";
import { AdZone } from "@/components/ad-zone";

type FaqItem = { question: string; answer: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BracketCalculator" });
  const title = t("pageTitle");
  const description = t("pageDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools/bracketing-calculator`,
      languages: languageAlternates("/tools/bracketing-calculator"),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${locale}/tools/bracketing-calculator`,
    },
  };
}

export default async function BracketingCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("BracketCalculator");
  const toolsHubT = await getTranslations("ToolsHub");
  const faqs: FaqItem[] = t.raw("faq");

  const breadcrumb = breadcrumbJsonLd([
    { name: "ExifLens", url: `${SITE_URL}/${locale}` },
    { name: toolsHubT("title"), url: `${SITE_URL}/${locale}/tools` },
    {
      name: t("pageTitle"),
      url: `${SITE_URL}/${locale}/tools/bracketing-calculator`,
    },
  ]);

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("pageTitle"),
    url: `${SITE_URL}/${locale}/tools/bracketing-calculator`,
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
        slug="bracketing-calculator"
        leftAlt={t("exampleLeftAlt")}
        rightAlt={t("exampleRightAlt")}
      />

      <BracketCalculatorCard />

      <AdZone
        id="bracketing-calculator-mid"
        label="Ad"
        size="300×250"
        className="max-w-[300px]"
      />

      <section className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground">
          {t("aboutTitle")}
        </h2>
        <p>{t("aboutBody")}</p>
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

      {process.env.NODE_ENV === "development" ? (
        <ToolImageDevPanel
          slug="bracketing-calculator"
          left={getToolImages("bracketing-calculator").left}
          right={getToolImages("bracketing-calculator").right}
          defaultQuery="camera tripod hdr exposure bracketing landscape"
        />
      ) : null}
    </div>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
