import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdZone } from "@/components/ad-zone";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: "ExifLens — EXIF Viewer & ND Filter Long Exposure Calculator",
    template: "%s · ExifLens",
  },
  description:
    "Drop a photo to instantly read its EXIF data and calculate the exact long exposure shutter speed for any ND filter. 100% client-side, no upload, no signup.",
};

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

  return (
    <html lang={locale} suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
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
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
