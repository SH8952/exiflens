"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useExifStore } from "@/store/exif-store";
import { GpsMapModal } from "@/components/gps-map-modal";
import { Link } from "@/i18n/navigation";
import { formatBytes } from "@/lib/image-ops";

/** 이 용량 이상이면 "용량 줄이기" 바로가기를 보여 준다 — 주요 SNS 사진 업로드 한도 중 가장 낮은 X(5MB) 기준(2026-10-08). */
const COMPRESS_LINK_MIN_BYTES = 5 * 1024 * 1024;
/** 이미지 압축기가 받는 파일 한 장의 최대 용량(batch-workbench 기본값과 같다). */
const COMPRESSOR_MAX_BYTES = 60 * 1024 * 1024;
const COMPRESSOR_ACCEPT_RE = /\.(jpe?g|png|webp)$/i;

function isCompressorSupported(file: File): boolean {
  return (
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    COMPRESSOR_ACCEPT_RE.test(file.name)
  );
}

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

export function ExifPanel({ showCompressLink = false }: { showCompressLink?: boolean }) {
  const t = useTranslations("Home");
  const status = useExifStore((s) => s.status);
  const data = useExifStore((s) => s.data);
  const file = useExifStore((s) => s.file);
  const setHandoffFile = useExifStore((s) => s.setHandoffFile);
  // 추출된 EXIF 목록에 GPS 위치 항목 추가, "지도보기" 클릭 시 구글 지도 모달로
  // 표시 (석한 요청, 2026-08-31). GPS 정보가 없는 사진은 다른 항목과 동일하게
  // "—"로 표시된다.
  const [showMap, setShowMap] = React.useState(false);

  const hasData = status === "success" && data !== null;
  const gps = hasData ? data.gps : null;
  // 파일 용량 — 촬영 날짜·시간 바로 아래(석한 요청, 2026-10-08). 5MB 이상이고 압축기가 받는
  // 형식(JPG·PNG·WebP, 60MB 이하)이면 "용량 줄이기" 바로가기를 보여 주고, 누르면 사진을 압축기로 넘긴다.
  const fileSizeLabel = hasData && file ? formatBytes(file.size) : null;
  const canCompress =
    showCompressLink &&
    hasData &&
    file !== null &&
    file.size >= COMPRESS_LINK_MIN_BYTES &&
    file.size <= COMPRESSOR_MAX_BYTES &&
    isCompressorSupported(file);

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
        {/* 촬영 날짜·시간 — GPS 위치 바로 아래 (석한 요청, 2026-10-03). 값이 없으면 "—" */}
        <Row
          label={t("takenAtDateTime")}
          value={hasData ? data.takenAt : null}
        />
        <dt className="text-muted-foreground">{t("fileSize")}</dt>
        <dd className="flex items-center justify-end gap-2 text-right font-medium">
          <span>{fileSizeLabel ?? "—"}</span>
          {canCompress && file ? (
            <Link
              href="/tools/image-compressor"
              onClick={() => setHandoffFile(file)}
              title={t("compressLinkTitle")}
              className="shrink-0 text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {t("compressLink")}
            </Link>
          ) : null}
        </dd>
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
