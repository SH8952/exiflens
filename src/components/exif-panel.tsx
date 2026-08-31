"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useExifStore } from "@/store/exif-store";
import { GpsMapModal } from "@/components/gps-map-modal";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value ?? "—"}</dd>
    </>
  );
}

function GpsRow({
  label,
  gps,
  viewMapLabel,
  onViewMap,
}: {
  label: string;
  gps: { latitude: number; longitude: number } | null;
  viewMapLabel: string;
  onViewMap: () => void;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center justify-end gap-2 text-right font-medium">
        {gps ? (
          <>
            <span>{`${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`}</span>
            <button
              type="button"
              onClick={onViewMap}
              className="shrink-0 text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {viewMapLabel}
            </button>
          </>
        ) : (
          "—"
        )}
      </dd>
    </>
  );
}

export function ExifPanel() {
  const t = useTranslations("Home");
  const status = useExifStore((s) => s.status);
  const data = useExifStore((s) => s.data);
  // 추출된 EXIF 목록에 GPS 위치 항목 추가, "지도보기" 클릭 시 구글 지도 모달로
  // 표시 (석한 요청, 2026-08-31). GPS 정보가 없는 사진은 다른 항목과 동일하게
  // "—"로 표시된다.
  const [showMap, setShowMap] = React.useState(false);

  const hasData = status === "success" && data !== null;
  const gps = hasData ? data.gps : null;

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
        <GpsRow
          label={t("gps")}
          gps={gps}
          viewMapLabel={t("viewOnMap")}
          onViewMap={() => setShowMap(true)}
        />
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">{t("exifEmpty")}</p>

      {showMap && gps ? (
        <GpsMapModal
          latitude={gps.latitude}
          longitude={gps.longitude}
          onClose={() => setShowMap(false)}
        />
      ) : null}
    </div>
  );
}
