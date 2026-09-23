import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLiveTools } from "@/lib/tools-roster";

/**
 * Homepage "사진 도구" highlights section — lists every live /tools
 * calculator (name + real one-line description, server-rendered so it's
 * fully crawlable) directly on the homepage with a deep link into
 * `/tools/[slug]`, plus a link to the full `/tools` hub.
 *
 * Two reasons this exists, both from the user directly:
 *  1. Desktop visitors who never open the header's "도구" menu have no way
 *     of knowing these calculators exist at all — surfacing them on the
 *     homepage itself is the fix.
 *  2. Google evaluates the homepage's own crawlable text/link richness when
 *     deciding whether a site is worth indexing well (same rationale as
 *     `home-guide-highlights.tsx`, added for AdSense re-review) — nine
 *     extra internal links plus real descriptive text on the homepage helps
 *     make the case that this is a substantial, content-rich site.
 *
 * Reuses `tools-roster.ts` (the same roster the /tools hub itself is built
 * from) as the single source of truth, so a new tool shipping there is
 * automatically picked up here too without any homepage-specific edit.
 */
export async function HomeToolsHighlights() {
  const t = await getTranslations("ToolsHub");
  const tHome = await getTranslations("Home");
  const liveTools = getLiveTools();

  if (liveTools.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {tHome("toolsHighlightsTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {tHome("toolsHighlightsSubtitle")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {liveTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 transition hover:border-foreground/30"
          >
            <h3 className="font-semibold leading-snug tracking-tight group-hover:underline">
              {t(`tools.${tool.slug}.name`)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(`tools.${tool.slug}.description`)}
            </p>
          </Link>
        ))}
      </div>

      <Link
        href="/tools"
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        {tHome("toolsHighlightsCta")}
      </Link>
    </section>
  );
}
