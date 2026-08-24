"use client";

import { useTranslations } from "next-intl";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExifStore } from "@/store/exif-store";

export function NdCalculatorCard() {
  const t = useTranslations("Home");
  const status = useExifStore((s) => s.status);
  const data = useExifStore((s) => s.data);

  // Fall back to a representative example until Phase 3 wires the live
  // ND-stop calculation. Once a photo is uploaded, the detected base
  // shutter speed is shown here immediately, per the Phase 2 spec.
  const baseShutter =
    status === "success" && data?.shutterSpeedLabel
      ? data.shutterSpeedLabel
      : "1/125s";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("ndSectionTitle")}
      </h2>
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("baseShutter")}</span>
          <span className="font-medium">{baseShutter}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("ndFilter")}</span>
          <span className="font-medium">ND1000 (10-stop)</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
          <span className="text-muted-foreground">{t("newShutter")}</span>
          <span className="text-lg font-semibold text-primary">8.2s</span>
        </div>
        <Button className="mt-2" size="sm" disabled>
          <Timer className="size-4" />
          {t("startTimer")}
        </Button>
      </div>
    </div>
  );
}
