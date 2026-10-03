import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  FIELD_TOOLS,
  POST_SHOOT_TOOLS,
  IMAGE_TOOLS,
  type ToolEntry,
} from "@/lib/tools-roster";

type FaqItem = { question: string; answer: string };

/**
 * Homepage FAQ highlights section — placed directly below the photo-tool
 * highlights so a visitor (or Googlebot) who was just looking at the tools
 * lands right on FAQ content that includes tool-specific questions too.
 *
 * Same rationale as `home-guide-highlights.tsx` / `home-tools-highlights.tsx`
 * (crawlable text/link richness for AdSense re-review + proving the site is
 * more than "just calculators"), plus the user's specific point: a page with
 * real question/answer content reads as more substantial than a page of pure
 * number-crunching tools.
 *
 * Reuses the exact same FAQ aggregation the `/faq` page already does (site-
 * level FAQ + every live tool's own FAQ, via `tools-roster.ts`) so this is
 * a single source of truth, not a second copy of the content. Picks 5 at
 * random on every request (dynamically rendered, same pattern as the guide
 * highlights) so repeat visits surface different questions over time.
 *
 * Also emits its own `FAQPage` JSON-LD for just the 5 questions shown here.
 * This duplicates a subset of the `/faq` page's own JSON-LD, but that's
 * fine — each page's structured data only ever describes content that is
 * genuinely visible on that same page, which is what Google's structured
 * data guidelines require, and it gives the homepage itself a shot at a
 * FAQ rich-result in search.
 */
function pickRandomFaqs<T>(items: T[], count: number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

async function collectToolFaqs(tools: ToolEntry[]): Promise<FaqItem[]> {
  const collected: FaqItem[] = [];
  for (const tool of tools) {
    if (tool.status !== "live" || !tool.faqNamespace) continue;
    const toolT = await getTranslations(tool.faqNamespace);
    collected.push(...(toolT.raw("faq") as FaqItem[]));
  }
  return collected;
}

export async function HomeFaqHighlights() {
  const t = await getTranslations("Home");

  const homeFaqs: FaqItem[] = t.raw("faq");
  const fieldFaqs = await collectToolFaqs(FIELD_TOOLS);
  const postShootFaqs = await collectToolFaqs(POST_SHOOT_TOOLS);
  const imageFaqs = await collectToolFaqs(IMAGE_TOOLS);
  const allFaqs: FaqItem[] = [
    ...homeFaqs,
    ...fieldFaqs,
    ...postShootFaqs,
    ...imageFaqs,
  ];

  const faqs = pickRandomFaqs(allFaqs, 5);
  if (faqs.length === 0) return null;

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
    <section className="flex flex-col gap-4 border-t border-border pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("faqHighlightsTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("faqHighlightsSubtitle")}
        </p>
      </div>

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

      <Link
        href="/faq"
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        {t("faqHighlightsCta")}
      </Link>
    </section>
  );
}
