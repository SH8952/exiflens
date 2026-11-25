import { getTranslations, setRequestLocale } from "next-intl/server";
import { webApplicationJsonLd, websiteJsonLd } from "@/lib/seo";
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

// 2026-11-15 홈 정적화(ISR): 홈이 요청마다 서버에서 만들어지면서 한동안 접속이 없을 때 첫 접속이 1~2초 느렸다(함수 콜드 스타트).
// 이제 CDN 캐시에서 바로 응답한다. 무작위 가이드/FAQ 카드는 새로 만들 때마다 다시 뽑히므로
// "요청마다"가 아니라 "재생성 주기마다" 바뀐다(노출되는 FAQ 항목과 FAQPage 구조화 데이터는 항상 같은 묶음으로 함께 갱신).
// 2026-11-25 CPU 다이어트(Vercel 경로별 분석): 재생성 주기 5분(300) → 1시간(3600). 블로그 목록 페이지(revalidate 3600)와 같은 주기라
// 예약 발행 글이 홈 카드에 나타나는 시점도 목록과 같다. 되돌리려면 300으로.
export const revalidate = 3600;

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd(locale)),
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
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ExifPanel
          showCompressLink={isToolAccessible("image-compressor")}
          showRemoverLink={isToolAccessible("exif-remover")}
        />
        <NdCalculatorCard />
      </section>

      {/* Privacy note: placed right under the EXIF/ND section, above the gear recommendations (moved up from below the ad zone on 2026-11-22). */}
      <p className="-mt-4 text-center text-xs text-muted-foreground">
        {t("privacyNote")}
      </p>

      {/* Gear recommendation (Coupang/AliExpress) → related tools (FlyDroneMap): restored to the original spot right after the ND calculator section on 2026-11-03 (was temporarily moved to the page bottom on 2026-10-02 during the AdSense review). */}
      <GearRecommendationSection locale={locale} />

      <CrossLinkFlyDroneMap locale={locale} />

      <AdZone
        id="mid-content"
        label="Ad"
        size="300×250"
        className="max-w-[300px]"
      />

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
    </div>
  );
}
