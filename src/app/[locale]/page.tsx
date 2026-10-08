import { getTranslations, setRequestLocale } from "next-intl/server";
import { webApplicationJsonLd } from "@/lib/seo";
import { AdZone } from "@/components/ad-zone";
import { ExifUploader } from "@/components/exif-uploader";
import { ExifPanel } from "@/components/exif-panel";
import { NdCalculatorCard } from "@/components/nd-calculator-card";
import { isToolAccessible } from "@/lib/tools-roster";
import { GearRecommendationSection } from "@/components/gear-recommendation-section";
import { CrossLinkFlyDroneMap } from "@/components/cross-link/cross-link-flydronemap";
import { HomeUsageSection } from "@/components/home-usage-section";
import { HomeTrustBadges } from "@/components/home-trust-badges";
import { HomeGuideHighlights } from "@/components/home-guide-highlights";
import { HomeToolsHighlights } from "@/components/home-tools-highlights";
import { HomeBlogHighlights } from "@/components/home-blog-highlights";
import { HomeFaqHighlights } from "@/components/home-faq-highlights";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  // 한국어: 단어 중간에서 줄바꿈되지 않도록 어절 단위로 줄바꿈(긴 영문·주소는 필요할 때만 끊김).
  const koWrap =
    locale === "ko" ? " [word-break:keep-all] [overflow-wrap:break-word]" : "";

  return (
    <div
      className={`mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10${koWrap}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationJsonLd(locale)),
        }}
      />

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {t("subtitle")}
        </p>
        <HomeTrustBadges />
      </div>

      {/* Section 1: Image Dropzone */}
      <ExifUploader />

      {/* Section 2 & 3: EXIF display + ND calculator */}
      <section className="grid gap-4 md:grid-cols-2">
        <ExifPanel showCompressLink={isToolAccessible("image-compressor")} />
        <NdCalculatorCard />
      </section>

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

      {/* Section 6: guide article highlights — homepage text/link richness for AdSense re-review. Picks 6 guides at random on every request. */}
      <HomeGuideHighlights locale={locale} />

      {/* Section 7: photo tool highlights — surfaces every live /tools calculator on the homepage itself, so desktop visitors who never open the header's tools menu still discover them; also adds more crawlable text/internal links for SEO. */}
      <HomeToolsHighlights />

      {/* Section 7.5: latest blog posts (ko only — the blog is Korean-only; renders nothing in other locales). */}
      <HomeBlogHighlights locale={locale} />

      {/* Section 8: FAQ highlights — placed right after the tool highlights since the FAQ pool includes tool-specific questions, so it reads naturally as "more about what you just saw". Picks 5 Q&A items at random (site-level + every live tool's FAQ) with their own FAQPage JSON-LD. */}
      <HomeFaqHighlights />

      {/* TEMPORARY (2026-10-02): the sister-site cross-link ("관련 도구" / Related tools → FlyDroneMap) was moved from right after the ND calculator section to here, between the FAQ highlights and the gear recommendation, while the AdSense review is pending. Once AdSense is approved, move it back to its original spot together with the gear recommendation: place <GearRecommendationSection /> and then <CrossLinkFlyDroneMap /> right after the ND calculator section ("Section 2 & 3") and before the <AdZone id="mid-content" />. */}
      <CrossLinkFlyDroneMap locale={locale} />

      {/* TEMPORARY (2026-10-02): gear recommendation (Coupang/AliExpress) moved to the very bottom of the home page while the AdSense review is pending. Original spot: right after the ND calculator section ("Section 2 & 3"), before the cross-link (see note above). */}
      <GearRecommendationSection locale={locale} />
    </div>
  );
}
