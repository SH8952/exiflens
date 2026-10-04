import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Textual "how to use" section below the tool UI on the homepage —
 * AdSense/SEO checklist item 2 ("메인 페이지 하단 설명 텍스트: 사용법, FAQ").
 * Google's crawler can't read the canvas-driven tool itself as text content,
 * so this section gives it real, crawlable prose to index.
 *
 * Each step is a { title, body } pair (messages `Home.usageSteps`), followed
 * by a row of internal links to the tools hub, guides, and FAQ (labels reuse
 * the header nav strings).
 *
 * NOTE: never mention hidden image tools by name in the usage copy — the
 * messages for hidden tools are stripped in production, and naming one here
 * would leak an unreleased feature.
 *
 * The FAQ half of this section was split out into its own /faq page
 * (linked from the header) so it can be reached in one click instead of
 * only after scrolling to the bottom of the homepage — see
 * `src/app/[locale]/faq/page.tsx` for the FAQPage JSON-LD and full list.
 */
type UsageStep = { title: string; body: string };

export async function HomeUsageSection() {
  const t = await getTranslations("Home");
  const tHeader = await getTranslations("Header");
  const steps = t.raw("usageSteps") as UsageStep[];

  const linkClass =
    "text-sm font-medium text-foreground underline-offset-4 hover:underline";

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-10">
      <h2 className="text-xl font-semibold tracking-tight">
        {t("usageTitle")}
      </h2>
      <ol className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {i + 1}
            </span>
            <div className="flex flex-col gap-1 pt-0.5">
              <h3 className="text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <nav className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
        <Link href="/tools" className={linkClass}>
          {tHeader("toolsNav")} →
        </Link>
        <Link href="/guides" className={linkClass}>
          {tHeader("guidesNav")} →
        </Link>
        <Link href="/faq" className={linkClass}>
          {tHeader("faqNav")} →
        </Link>
      </nav>
    </section>
  );
}
