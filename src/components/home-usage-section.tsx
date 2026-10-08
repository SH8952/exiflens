import { getTranslations } from "next-intl/server";
import {
  Compass,
  Frame,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Timer,
  Upload,
  type LucideIcon,
} from "lucide-react";
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

// 단계 순서(messages `Home.usageSteps`)와 같은 순서의 장식용 아이콘. 단계가 더 늘어나면
// 마지막 아이콘(Compass)을 재사용한다. 문구는 건드리지 않는다.
const STEP_ICONS: LucideIcon[] = [
  Upload,
  ScanSearch,
  MapPin,
  Timer,
  Frame,
  ShieldCheck,
  Compass,
];

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
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[Math.min(i, STEP_ICONS.length - 1)];
          // 단계 수가 홀수·3으로 나눠 1개가 남으면(예: 7개) 마지막 카드를 가로 전체로 펼쳐 빈칸을 없앤다.
          const spanLast =
            i === steps.length - 1 &&
            steps.length % 2 === 1 &&
            steps.length % 3 === 1;
          return (
            <li
              key={i}
              className={`flex flex-col gap-3 rounded-xl border border-border bg-card p-5 ${
                spanLast ? "sm:col-span-2 lg:col-span-3" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
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
