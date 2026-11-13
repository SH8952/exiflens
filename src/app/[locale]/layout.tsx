import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { pickMessages } from "@/i18n/client-messages";
import { routing } from "@/i18n/routing";
import { CONSENT_REGION_CODES } from "@/lib/consent";
import { ConsentBanner } from "@/components/consent-banner";
import { SITE_URL, languageAlternates, ogLocale, DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "@/lib/seo";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdZone } from "@/components/ad-zone";
import { DevServerWatch } from "@/components/dev/dev-server-watch";
import "../globals.css";

// 2026-11-13 Vercel 사용량 최적화: 모든 페이지가 공통으로 쓰는 클라이언트 번역만 브라우저로 전달한다.
// (헤더·푸터·동의 배너·공유·오류 화면·가이드/블로그 공통 문구). 페이지별 도구 번역은 각 폴더의 layout.tsx 에서 추가한다.
const LAYOUT_NAMESPACES = ["Consent", "ErrorPage", "Footer", "Guides", "Header", "Home", "Share"];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// GA4 measurement ID isn't a secret — it's exposed in every page's public
// HTML/network requests regardless, so it's fine to hardcode rather than
// wire up an env var for it.
const GA4_MEASUREMENT_ID = "G-1P4CBYCR1V";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
// AdSense's script tag requires the "ca-" prefixed client id (e.g.
// "ca-pub-XXXX"), while ads.txt and most dashboards use the bare "pub-XXXX"
// form. Normalize here so either form works in the env var.
const ADSENSE_CLIENT_ID = ADSENSE_PUBLISHER_ID
  ? ADSENSE_PUBLISHER_ID.startsWith("ca-")
    ? ADSENSE_PUBLISHER_ID
    : `ca-${ADSENSE_PUBLISHER_ID}`
  : undefined;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  // 언어별 홈 제목(Home.metaTitle) — 한국어 검색(네이버 등)에서 "ND 필터 계산기" 키워드가 제목에 보이도록.
  const title = t("metaTitle");
  const description = t("subtitle");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: "%s · ExifLens",
    },
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: languageAlternates(),
      types: {
        "application/rss+xml": `${SITE_URL}/rss.xml`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      description,
      url: `${SITE_URL}/${locale}`,
      images: DEFAULT_OG_IMAGES,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: DEFAULT_TWITTER_IMAGES,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  // 2026-10-18 CPU 다이어트: 이전에는 여기서 headers()로 방문자 국가를 읽어
  // 동의 배너 필요 여부를 서버에서 계산했는데, 레이아웃이 요청 헤더를 읽으면
  // 하위 모든 페이지가 요청마다 서버에서 새로 렌더링되어 함수 CPU를 소모한다.
  // 판정 자체(needsConsentBanner)는 그대로 두고, 입력값만 proxy가 심어 두는
  // geo-country 쿠키를 브라우저에서 읽도록 ConsentBanner 안으로 옮겼다.

  return (
    <html lang={locale} suppressHydrationWarning className="h-full antialiased">
      <head>
        <Script
          async
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              region: ${JSON.stringify(CONSENT_REGION_CODES)},
              wait_for_update: 500
            });
            gtag('js', new Date());
            if (!/(?:^|; )dev_exclude=1(?:;|$)/.test(document.cookie) &&
              ['localhost', '127.0.0.1', '[::1]'].indexOf(location.hostname) === -1) {
              gtag('config', '${GA4_MEASUREMENT_ID}');
            }
          `}
        </Script>
        {ADSENSE_CLIENT_ID ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={pickMessages(messages, LAYOUT_NAMESPACES)}>
            <SiteHeader />
            <div className="w-full px-4 py-3">
              <AdZone
                id="top-leaderboard"
                label="Ad"
                size="728×90"
                className="max-w-[728px]"
              />
            </div>
            <main className="flex-1">{children}</main>
            <div className="w-full px-4 py-3">
              <AdZone
                id="bottom-infeed"
                label="Ad"
                size="in-feed"
                className="max-w-3xl"
              />
            </div>
            <SiteFooter />
            <ConsentBanner />
          </NextIntlClientProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "development" ? <DevServerWatch /> : null}
      </body>
    </html>
  );
}
