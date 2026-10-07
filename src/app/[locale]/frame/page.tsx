import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL, languageAlternates, ogLocale, webApplicationJsonLd, DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "@/lib/seo";
import { ExifFrameGenerator } from "@/components/exif-frame-generator";
import {
  ToolSections,
  type ToolRelated,
  type ToolSection,
} from "@/components/tools/tool-sections";
import { BackLink } from "@/components/back-link";

type FaqItem = { question: string; answer: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Frame" });
  const title = t("title");
  const description = t("subtitle");

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/frame`,
      languages: languageAlternates("/frame"),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${locale}/frame`,
      images: DEFAULT_OG_IMAGES,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: DEFAULT_TWITTER_IMAGES,
    },
  };
}

export default async function FramePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Frame");
  const frameJsonLd = {
    ...webApplicationJsonLd(locale),
    url: `${SITE_URL}/${locale}/frame`,
  };
  const faqs: FaqItem[] = t.raw("faq");
  const sections = t.raw("sections") as ToolSection[];
  const related = t.raw("related") as ToolRelated;
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <BackLink to="home" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(frameJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <ExifFrameGenerator />

      <p className="text-center text-xs text-muted-foreground">
        {t("privacyNote")}
      </p>

      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <section className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">
            {t("aboutTitle")}
          </h2>
          <p>{t("aboutBody")}</p>
          <ToolSections sections={sections} related={related} />
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
    </div>
  );
}
