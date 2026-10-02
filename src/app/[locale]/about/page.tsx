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
  const story = t.raw("story") as {
    heading: string;
    intro: string;
    steps: { period: string; body: string }[];
  };
  const gear = t.raw("gear") as {
    heading: string;
    intro: string;
    columns: { name: string; use: string; purchased: string };
    groups: {
      name: string;
      items: { name: string; note: string; date: string }[];
    }[];
    previousHeading: string;
    previous: string;
    cropLabel: string;
  };
  const allSections = t.raw("sections") as {
    heading: string;
    body: string[];
  }[];
  // 마지막 섹션(문의)은 스토리·장비·갤러리 뒤에 표시한다.
  const contact = allSections[allSections.length - 1];
  const mainSections = allSections.slice(0, -1);

  return (
    <LegalPage title={t("title")} sections={mainSections}>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {story.heading}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {story.intro}
          </p>
        </div>
        <ol className="flex flex-col gap-4 border-l pl-4">
          {story.steps.map((step) => (
            <li key={step.period} className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold">{step.period}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {gear.heading}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {gear.intro}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          {gear.groups.map((group) => (
            <div key={group.name} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">{group.name}</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">
                        {gear.columns.name}
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium">
                        {gear.columns.use}
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-3 py-2 font-medium"
                      >
                        {gear.columns.purchased}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {group.items.map((item) => (
                      <tr key={item.name} className="align-top">
                        <th
                          scope="row"
                          className="px-3 py-2 font-medium text-foreground"
                        >
                          {item.name}
                        </th>
                        <td className="px-3 py-2 text-muted-foreground">
                          {item.note || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                          {item.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">
            {gear.previousHeading}:
          </span>{" "}
          {gear.previous}
        </p>
        <p className="text-sm">
          <Link
            href="/tools/crop-factor-calculator"
            className="font-medium underline underline-offset-4"
          >
            {gear.cropLabel}
          </Link>
        </p>
      </section>

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

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          {contact.heading}
        </h2>
        {contact.body.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </section>
    </LegalPage>
  );
}
