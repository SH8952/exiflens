import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL, languageAlternates, ogLocale, breadcrumbJsonLd } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { AdZone } from "@/components/ad-zone";

type ToolStatus = "live" | "comingSoon";

type ToolEntry = {
  slug: string;
  status: ToolStatus;
};

type ResolvedTool = ToolEntry & { name: string; description: string };

/**
 * Tool roster for the /tools hub. New tools are built in the order agreed
 * with the user (photo-field calculators first, then post-shoot/pro tools);
 * each one flips from "comingSoon" to "live" once its own route ships.
 * Sections mirror the "use-case" grouping (field vs. post-shoot) already
 * agreed for exifnd.com's Guides categorization, per
 * claude/exiflens-tool-expansion-strategy-and-freeimgfix-benchmark.md.
 */
const FIELD_TOOLS: ToolEntry[] = [
  { slug: "dof-calculator", status: "live" },
  { slug: "exposure-stops-calculator", status: "comingSoon" },
  { slug: "timelapse-calculator", status: "comingSoon" },
  { slug: "astrophotography-calculator", status: "comingSoon" },
  { slug: "bracketing-calculator", status: "comingSoon" },
];

const POST_SHOOT_TOOLS: ToolEntry[] = [
  { slug: "print-resolution-calculator", status: "comingSoon" },
  { slug: "storage-calculator", status: "comingSoon" },
  { slug: "exif-remover", status: "comingSoon" },
  { slug: "crop-factor-calculator", status: "comingSoon" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ToolsHub" });
  const title = t("title");
  const description = t("subtitle");

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools`,
      languages: languageAlternates("/tools"),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${locale}/tools`,
    },
  };
}

export default async function ToolsHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ToolsHub");

  const resolve = (tools: ToolEntry[]): ResolvedTool[] =>
    tools.map((tool) => ({
      ...tool,
      name: t(`tools.${tool.slug}.name`),
      description: t(`tools.${tool.slug}.description`),
    }));

  const fieldTools = resolve(FIELD_TOOLS);
  const postShootTools = resolve(POST_SHOOT_TOOLS);
  const comingSoonLabel = t("comingSoon");

  const breadcrumb = breadcrumbJsonLd([
    { name: "ExifLens", url: `${SITE_URL}/${locale}` },
    { name: t("title"), url: `${SITE_URL}/${locale}/tools` },
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <ToolSection
        title={t("fieldSectionTitle")}
        tools={fieldTools}
        comingSoonLabel={comingSoonLabel}
      />
      <ToolSection
        title={t("postShootSectionTitle")}
        tools={postShootTools}
        comingSoonLabel={comingSoonLabel}
      />

      <AdZone
        id="tools-hub-mid"
        label="Ad"
        size="300×250"
        className="max-w-[300px]"
      />
    </div>
  );
}

function ToolSection({
  title,
  tools,
  comingSoonLabel,
}: {
  title: string;
  tools: ResolvedTool[];
  comingSoonLabel: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} comingSoonLabel={comingSoonLabel} />
        ))}
      </div>
    </section>
  );
}

function ToolCard({
  tool,
  comingSoonLabel,
}: {
  tool: ResolvedTool;
  comingSoonLabel: string;
}) {
  const card = (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <h3 className="font-semibold">{tool.name}</h3>
      <p className="text-sm text-muted-foreground">{tool.description}</p>
      {tool.status === "comingSoon" ? (
        <span className="mt-auto inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {comingSoonLabel}
        </span>
      ) : null}
    </div>
  );

  if (tool.status === "comingSoon") {
    return <div className="opacity-70">{card}</div>;
  }

  return (
    <Link href={`/tools/${tool.slug}`} className="block h-full">
      {card}
    </Link>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
