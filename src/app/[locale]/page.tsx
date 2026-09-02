import { getTranslations, setRequestLocale } from "next-intl/server";
import { webApplicationJsonLd } from "@/lib/seo";
import { AdZone } from "@/components/ad-zone";
import { ExifUploader } from "@/components/exif-uploader";
import { ExifPanel } from "@/components/exif-panel";
import { NdCalculatorCard } from "@/components/nd-calculator-card";
import { GearRecommendationSection } from "@/components/gear-recommendation-section";
import { CrossLinkFlyDroneMap } from "@/components/cross-link/cross-link-flydronemap";
import { HomeUsageSection } from "@/components/home-usage-section";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationJsonLd(locale)),
        }}
      />

      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Section 1: Image Dropzone */}
      <ExifUploader />

      {/* Section 2 & 3: EXIF display + ND calculator */}
      <section className="grid gap-4 md:grid-cols-2">
        <ExifPanel />
        <NdCalculatorCard />
      </section>

      {/* Section 4: Gear recommendation */}
      <GearRecommendationSection locale={locale} />

      {/* Section 4.5: cross-link to sister site (contextual, single link) */}
      <CrossLinkFlyDroneMap locale={locale} />

      <AdZone
        id="mid-content"
        label="Ad"
        size="300×250"
        className="max-w-[300px]"
      />

      <p className="text-center text-xs text-muted-foreground">
        {t("privacyNote")}
      </p>

      {/* Section 5: crawlable usage text (AdSense/SEO checklist item 2). FAQ now lives on its own /faq page. */}
      <HomeUsageSection />
    </div>
  );
}
