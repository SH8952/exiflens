"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface GpsMapModalProps {
  latitude: number;
  longitude: number;
  onClose: () => void;
}

/**
 * Lightweight custom modal (no new dependency) showing an embedded Google
 * Map for a photo's extracted GPS coordinates. Everything here runs
 * client-side against Google's public no-API-key embed URL — the site never
 * sends the photo or its location to any server of its own (석한 요청,
 * 2026-08-31: 추출된 EXIF 목록에 GPS 위치 + "지도보기" 모달 추가).
 */
export function GpsMapModal({ latitude, longitude, onClose }: GpsMapModalProps) {
  const t = useTranslations("Home");

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const mapSrc = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("gpsMapTitle")}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-medium">{t("gpsMapTitle")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("gpsMapClose")}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <iframe
          title={t("gpsMapTitle")}
          src={mapSrc}
          className="h-[60vh] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
