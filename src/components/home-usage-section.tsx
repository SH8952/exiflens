import { getTranslations } from "next-intl/server";

/**
 * Textual "how to use" section below the tool UI on the homepage —
 * AdSense/SEO checklist item 2 ("메인 페이지 하단 설명 텍스트: 사용법, FAQ").
 * Google's crawler can't read the canvas-driven tool itself as text content,
 * so this section gives it real, crawlable prose to index.
 *
 * The FAQ half of this section was split out into its own /faq page
 * (linked from the header) so it can be reached in one click instead of
 * only after scrolling to the bottom of the homepage — see
 * `src/app/[locale]/faq/page.tsx` for the FAQPage JSON-LD and full list.
 */
export async function HomeUsageSection() {
  const t = await getTranslations("Home");
  const steps: string[] = t.raw("usageSteps");

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-10">
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
    </section>
  );
}
