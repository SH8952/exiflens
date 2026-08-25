import { getTranslations } from "next-intl/server";

type FaqItem = { question: string; answer: string };

/**
 * Textual "how to use" + FAQ section below the tool UI on the homepage —
 * AdSense/SEO checklist item 2 ("메인 페이지 하단 설명 텍스트: 사용법, FAQ").
 * Google's crawler can't read the canvas-driven tool itself as text content,
 * so this section gives it real, crawlable prose to index. Also emits
 * FAQPage JSON-LD so eligible questions can surface as rich snippets.
 */
export async function HomeFaqSection() {
  const t = await getTranslations("Home");
  const steps: string[] = t.raw("usageSteps");
  const faqs: FaqItem[] = t.raw("faq");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="flex flex-col gap-10 border-t border-border pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("usageTitle")}
        </h2>
        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("faqTitle")}
        </h2>
        <div className="flex flex-col gap-2">
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
        </div>
      </div>
    </section>
  );
}
