import { getTranslations, setRequestLocale } from "next-intl/server";
import { UploadCloud, Timer } from "lucide-react";
import { AdZone } from "@/components/ad-zone";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Section 1: Image Dropzone */}
      <section
        aria-label="EXIF uploader"
        className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-10 text-center transition-colors hover:border-primary/50"
      >
        <UploadCloud className="size-8 text-muted-foreground" />
        <p className="text-base font-medium">{t("uploaderTitle")}</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("uploaderHint")}
        </p>
        <Button variant="secondary" size="sm">
          {t("uploaderButton")}
        </Button>
      </section>

      {/* Section 2 & 3: EXIF display + ND calculator */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("exifSectionTitle")}
          </h2>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-muted-foreground">{t("camera")}</dt>
            <dd className="text-right font-medium">—</dd>
            <dt className="text-muted-foreground">{t("lens")}</dt>
            <dd className="text-right font-medium">—</dd>
            <dt className="text-muted-foreground">{t("shutter")}</dt>
            <dd className="text-right font-medium">—</dd>
            <dt className="text-muted-foreground">{t("aperture")}</dt>
            <dd className="text-right font-medium">—</dd>
            <dt className="text-muted-foreground">{t("iso")}</dt>
            <dd className="text-right font-medium">—</dd>
            <dt className="text-muted-foreground">{t("focalLength")}</dt>
            <dd className="text-right font-medium">—</dd>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("exifEmpty")}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("ndSectionTitle")}
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("baseShutter")}
              </span>
              <span className="font-medium">1/125s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("ndFilter")}</span>
              <span className="font-medium">ND1000 (10-stop)</span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
              <span className="text-muted-foreground">{t("newShutter")}</span>
              <span className="text-lg font-semibold text-primary">
                8.2s
              </span>
            </div>
            <Button className="mt-2" size="sm">
              <Timer className="size-4" />
              {t("startTimer")}
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: Gear recommendation */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("gearSectionTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("gearSectionHint")}
        </p>
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
    </div>
  );
}
