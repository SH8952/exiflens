"use client";

import { useTranslations } from "next-intl";
import { useExifStore } from "@/store/exif-store";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value ?? "—"}</dd>
    </>
  );
}

export function ExifPanel() {
  const t = useTranslations("Home");
  const status = useExifStore((s) => s.status);
  const data = useExifStore((s) => s.data);

  const hasData = status === "success" && data !== null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("exifSectionTitle")}
      </h2>
      <dl className="grid grid-cols-2 gap-y-3 text-sm">
        <Row label={t("camera")} value={hasData ? data.camera : null} />
        <Row label={t("lens")} value={hasData ? data.lens : null} />
        <Row
          label={t("shutter")}
          value={hasData ? data.shutterSpeedLabel : null}
        />
        <Row label={t("aperture")} value={hasData ? data.aperture : null} />
        <Row label={t("iso")} value={hasData ? data.iso : null} />
        <Row
          label={t("focalLength")}
          value={hasData ? data.focalLength : null}
        />
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">{t("exifEmpty")}</p>
    </div>
  );
}
