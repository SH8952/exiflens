import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE_URL, languageAlternates, ogLocale, breadcrumbJsonLd } from "@/lib/seo";
import { isToolAccessible } from "@/lib/tools-roster";
import { AdZone } from "@/components/ad-zone";
import { ToolExampleImages } from "@/components/tools/tool-example-images";
import { ToolImageDevPanel } from "@/components/dev/tool-image-dev-panel";
import { getToolImages } from "@/lib/tool-images";
import { ShareButton } from "@/components/share-button";
import {
  ToolSections,
  type ToolRelated,
  type ToolSection,
} from "@/components/tools/tool-sections";

type FaqItem = { question: string; answer: string };

/**
 * 이미지 편집·변환 도구 6종이 공유하는 페이지 틀. 각 도구는 자기 네임스페이스에
 * pageTitle / pageDescription / aboutTitle / aboutBody / sections / (related) /
 * disclaimer / faqTitle / faq 를 둔다. (exif-remover 페이지와 같은 구조)
 */
/** 개발자 전용 "이미지 관리" 패널의 도구별 기본 검색어 (Unsplash, 영어가 결과가 좋음) */
const DEV_PANEL_QUERIES: Record<string, string> = {
  "image-compressor": "photo file size compress laptop",
  "image-resizer": "photo resize frame size comparison",
  "image-converter": "photo files folder convert",
  "image-crop-rotate": "photo crop composition frame",
  "image-watermark": "photographer signature photo copyright",
  "image-mosaic": "privacy blur crowd faces",
};

export async function buildImageToolMetadata(
  locale: string,
  slug: string,
  namespace: string,
): Promise<Metadata> {
  if (!isToolAccessible(slug)) {
    return { robots: { index: false, follow: false } };
  }
  const t = await getTranslations({ locale, namespace });
  const title = t("pageTitle");
  const description = t("pageDescription");
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools/${slug}`,
      languages: languageAlternates(`/tools/${slug}`),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${locale}/tools/${slug}`,
    },
  };
}

export async function ImageToolPage({
  locale,
  slug,
  namespace,
  children,
}: {
  locale: string;
  slug: string;
  namespace: string;
  children: ReactNode;
}) {
  const t = await getTranslations(namespace);
  const toolsHubT = await getTranslations("ToolsHub");
  const faqs = t.raw("faq") as FaqItem[];
  const sections = t.raw("sections") as ToolSection[];
  const related = t.has("related") ? (t.raw("related") as ToolRelated) : undefined;
  const url = `${SITE_URL}/${locale}/tools/${slug}`;

  const breadcrumb = breadcrumbJsonLd([
    { name: "ExifLens", url: `${SITE_URL}/${locale}` },
    { name: toolsHubT("title"), url: `${SITE_URL}/${locale}/tools` },
    { name: t("pageTitle"), url },
  ]);

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("pageTitle"),
    url,
    applicationCategory: "MultimediaApplication",
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
        slug={slug}
        leftAlt={t("exampleLeftAlt")}
        rightAlt={t("exampleRightAlt")}
      />

      {children}

      <AdZone
        id={`${slug}-mid`}
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
              url={url}
            />
          </div>
          <p>{t("aboutBody")}</p>
          <ToolSections sections={sections} related={related} />
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
          slug={slug}
          left={getToolImages(slug).left}
          right={getToolImages(slug).right}
          defaultQuery={DEV_PANEL_QUERIES[slug]}
        />
      ) : null}
    </div>
  );
}
