import { getTranslations } from "next-intl/server";
import { Wind, ArrowUpRight } from "lucide-react";

/**
 * Contextual cross-link to the sister site FlyDroneMap (drone flight
 * weather & KP index dashboard). Intentionally a single, on-topic link
 * placed right after the gear recommendation section — not a site-wide
 * banner — to stay clearly on the right side of Google's link scheme
 * guidance (a small number of genuinely relevant links vs. mechanical
 * reciprocal linking). Kept as `rel="noopener noreferrer"` (no
 * nofollow/sponsored): this is a legitimate same-owner tool
 * recommendation, not a paid or manipulative link.
 */
export async function CrossLinkFlyDroneMap({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <section
      aria-labelledby="cross-link-flydronemap-heading"
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2">
        <Wind className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h3
          id="cross-link-flydronemap-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {t("crossLinkTitle")}
        </h3>
      </div>

      <p className="mt-2 text-sm text-foreground/90">
        {t("crossLinkDescription")}
      </p>

      <a
        href="https://flydronemap.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("crossLinkCtaAria")}
        className="mt-3 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {t("crossLinkCta")}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </section>
  );
}
