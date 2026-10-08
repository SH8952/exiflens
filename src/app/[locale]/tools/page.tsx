import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL, languageAlternates, ogLocale, breadcrumbJsonLd, DEFAULT_OG_IMAGES } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { AdZone } from "@/components/ad-zone";
import {
  FIELD_TOOLS,
  POST_SHOOT_TOOLS,
  IMAGE_TOOLS,
  getVisibleTools,
  type ToolEntry,
} from "@/lib/tools-roster";
import { BackLink } from "@/components/back-link";
import { ToolCardImage } from "@/components/tools/tool-card-image";

type ResolvedTool = ToolEntry & { name: string; description: string };

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
      images: DEFAULT_OG_IMAGES,
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
    getVisibleTools(tools).map((tool) => ({
      ...tool,
      name: t(`tools.${tool.slug}.name`),
      description: t(`tools.${tool.slug}.description`),
    }));

  const fieldTools = resolve(FIELD_TOOLS);
  const postShootTools = resolve(POST_SHOOT_TOOLS);
  const imageTools = resolve(IMAGE_TOOLS);
  const comingSoonLabel = t("comingSoon");

  const breadcrumb = breadcrumbJsonLd([
    { name: "ExifLens", url: `${SITE_URL}/${locale}` },
    { name: t("title"), url: `${SITE_URL}/${locale}/tools` },
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <BackLink to="home" className="-mb-2" />
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
        prioritizeImages
      />
      <ToolSection
        title={t("postShootSectionTitle")}
        tools={postShootTools}
        comingSoonLabel={comingSoonLabel}
      />
      <ToolSection
        title={t("imageSectionTitle")}
        tools={imageTools}
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
  prioritizeImages = false,
}: {
  title: string;
  tools: ResolvedTool[];
  comingSoonLabel: string;
  prioritizeImages?: boolean;
}) {
  if (tools.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <ToolCard
            key={tool.slug}
            tool={tool}
            comingSoonLabel={comingSoonLabel}
            priorityImage={prioritizeImages && index < 3}
          />
        ))}
      </div>
    </section>
  );
}

function ToolCard({
  tool,
  comingSoonLabel,
  priorityImage,
}: {
  tool: ResolvedTool;
  comingSoonLabel: string;
  priorityImage: boolean;
}) {
  const card = (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50">
      <ToolCardImage
        slug={tool.slug}
        sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
        priority={priorityImage}
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-semibold">{tool.name}</h3>
        {tool.status === "hidden" ? (
          <span className="w-fit rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-600">
            DEV ONLY · 숨김
          </span>
        ) : null}
        <p className="text-sm text-muted-foreground">{tool.description}</p>
        {tool.status === "comingSoon" ? (
          <span className="mt-auto inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {comingSoonLabel}
          </span>
        ) : null}
      </div>
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
