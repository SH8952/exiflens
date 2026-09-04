import { getTranslations } from "next-intl/server";
import { ImageUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/**
 * In-article CTA banner nudging guide readers toward the main EXIF tool
 * on the homepage. Placed at the top and bottom of the guide body.
 * Content-agnostic (no per-guide copy), so it applies uniformly across
 * every guide and every locale without touching guide content itself.
 */
export async function GuideToolCta({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Guides" });

  return (
    <aside className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <ImageUp
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-sm text-foreground/90">{t("ctaBannerText")}</p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/">{t("ctaBannerButton")}</Link>
      </Button>
    </aside>
  );
}
