import { getTranslations } from "next-intl/server";
import { ImageUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HOME_TOOL, getGuideTools } from "@/lib/guide-tools";

/**
 * In-article CTA banner placed at the top and bottom of the guide body.
 * When the guide has a mapped tool (src/lib/guide-tools.ts) the banner points to
 * the tool that matches the article (top = first tool, bottom = second tool).
 * Guides/blog posts without a mapping keep the generic "analyze your photo" copy.
 */
export async function GuideToolCta({
  locale,
  slug,
  position = "top",
}: {
  locale: string;
  slug?: string;
  position?: "top" | "bottom";
}) {
  const t = await getTranslations({ locale, namespace: "Guides" });
  const mapped = slug ? getGuideTools(slug) : null;

  let text = t("ctaBannerText");
  let button = t("ctaBannerButton");
  let href = "/tools";

  if (mapped && mapped.length > 0) {
    const toolSlug =
      position === "bottom" ? (mapped[1] ?? mapped[0]) : mapped[0];
    const tHub = await getTranslations({ locale, namespace: "ToolsHub" });
    const name =
      toolSlug === HOME_TOOL
        ? t("homeToolName")
        : tHub(`tools.${toolSlug}.name`);
    text = t("ctaToolText", { tool: name });
    button = t("ctaToolButton");
    href = toolSlug === HOME_TOOL ? "/" : `/tools/${toolSlug}`;
  } else {
    href = "/";
  }

  return (
    <aside className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <ImageUp
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-sm text-foreground/90">{text}</p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href={href}>{button}</Link>
      </Button>
    </aside>
  );
}
