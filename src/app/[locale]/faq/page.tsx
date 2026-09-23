import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL, languageAlternates, ogLocale } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { FIELD_TOOLS, POST_SHOOT_TOOLS, type ToolEntry } from "@/lib/tools-roster";

type FaqItem = { question: string; answer: string };
type ToolFaqGroup = { slug: string; name: string; faqs: FaqItem[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq" });
  const title = t("title");
  const description = t("subtitle");

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/faq`,
      languages: languageAlternates("/faq"),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${locale}/faq`,
    },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Faq");
  const home = await getTranslations("Home");
  const toolsHubT = await getTranslations("ToolsHub");

  const homeFaqs: FaqItem[] = home.raw("faq");

  const buildToolGroups = async (tools: ToolEntry[]): Promise<ToolFaqGroup[]> => {
    const groups: ToolFaqGroup[] = [];
    for (const tool of tools) {
      if (tool.status !== "live" || !tool.faqNamespace) continue;
      const toolT = await getTranslations(tool.faqNamespace);
      groups.push({
        slug: tool.slug,
        name: toolsHubT(`tools.${tool.slug}.name`),
        faqs: toolT.raw("faq") as FaqItem[],
      });
    }
    return groups;
  };

  const fieldGroups = await buildToolGroups(FIELD_TOOLS);
  const postShootGroups = await buildToolGroups(POST_SHOOT_TOOLS);

  // Every question on the page, flattened, feeds a single FAQPage JSON-LD
  // block — combining the site-level FAQ with every live tool's own FAQ
  // gives Google one large, well-structured FAQ document instead of the
  // tool-specific FAQs only ever appearing in isolation on their own pages.
  const allFaqs: FaqItem[] = [
    ...homeFaqs,
    ...fieldGroups.flatMap((g) => g.faqs),
    ...postShootGroups.flatMap((g) => g.faqs),
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10">
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

      <FaqCategory title={t("generalSectionTitle")} faqs={homeFaqs} />
      <FaqToolCategory title={toolsHubT("fieldSectionTitle")} groups={fieldGroups} />
      <FaqToolCategory title={toolsHubT("postShootSectionTitle")} groups={postShootGroups} />
    </div>
  );
}

function FaqCategory({ title, faqs }: { title: string; faqs: FaqItem[] }) {
  if (faqs.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <FaqList faqs={faqs} />
    </section>
  );
}

function FaqToolCategory({
  title,
  groups,
}: {
  title: string;
  groups: ToolFaqGroup[];
}) {
  if (groups.length === 0) return null;
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {groups.map((group) => (
        <div key={group.slug} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            <Link href={`/tools/${group.slug}`} className="hover:text-foreground hover:underline">
              {group.name}
            </Link>
          </h3>
          <FaqList faqs={group.faqs} />
        </div>
      ))}
    </section>
  );
}

function FaqList({ faqs }: { faqs: FaqItem[] }) {
  return (
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
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
