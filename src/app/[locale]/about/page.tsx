import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL, languageAlternates, ogLocale } from "@/lib/seo";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { LegalPage } from "@/components/legal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  const title = t("title");

  return {
    title,
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages: languageAlternates("/about"),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "ExifLens",
      title,
      url: `${SITE_URL}/${locale}/about`,
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const gallery = t.raw("gallery") as {
    heading: string;
    intro: string;
    linkLabel: string;
    items: { file: string; caption: string; alt: string }[];
  };

  return (
    <LegalPage title={t("title")} sections={t.raw("sections")}>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {gallery.heading}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {gallery.intro}
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {gallery.items.map((item) => (
            <li key={item.file}>
              <figure className="flex flex-col gap-1.5">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
                  <Image
                    src={`/guides/photos/${item.file}.webp`}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 768px) 368px, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-xs text-muted-foreground">
                  {item.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="text-sm">
          <Link
            href="/guides/six-frames-light-timing-and-composition"
            className="font-medium underline underline-offset-4"
          >
            {gallery.linkLabel}
          </Link>
        </p>
      </section>
    </LegalPage>
  );
}
