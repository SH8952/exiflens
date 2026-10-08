import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL, languageAlternates, ogLocale, DEFAULT_OG_IMAGES } from "@/lib/seo";
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
      images: DEFAULT_OG_IMAGES,
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
    expandLabel: string;
    collapseLabel: string;
    steps: { period: string; body: string }[];
  };
  const gear = t.raw("gear") as {
    heading: string;
    intro: string;
    columns: { name: string; use: string; purchased: string };
    groups: {
      name: string;
      items: { name: string; sub?: string; note: string; date: string }[];
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
      <section>
        <details className="group rounded-xl border bg-muted/30 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <h2 className="border-l-4 border-primary pl-3 text-lg font-semibold tracking-tight">
              {story.heading}
            </h2>
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
              <span className="group-open:hidden">{story.expandLabel}</span>
              <span className="hidden group-open:inline">
                {story.collapseLabel}
              </span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </span>
          </summary>
          <div className="flex flex-col gap-4 px-4 pb-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {story.intro}
            </p>
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
          </div>
        </details>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="border-l-4 border-primary pl-3 text-lg font-semibold tracking-tight">
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
              <div className="overflow-x-auto rounded-xl border shadow-sm">
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
                      <tr key={item.name} className="align-top transition-colors hover:bg-muted/40">
                        <th
                          scope="row"
                          className="px-3 py-2 font-medium text-foreground"
                        >
                          {item.name}
                          {item.sub ? (
                            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                              {item.sub}
                            </span>
                          ) : null}
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
          <h2 className="border-l-4 border-primary pl-3 text-lg font-semibold tracking-tight">
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
                <div className="group/photo relative aspect-[3/2] w-full overflow-hidden rounded-xl shadow-sm">
                  <Image
                    src={`/guides/photos/${item.file}.webp`}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 768px) 368px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover/photo:scale-105"
                  />
                </div>
                <figcaption className="px-1 text-xs leading-relaxed text-muted-foreground">
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

      <section className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-5 shadow-sm">
        <h2 className="border-l-4 border-primary pl-3 text-lg font-semibold tracking-tight">
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
