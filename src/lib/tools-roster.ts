export type ToolStatus = "live" | "comingSoon";

export type ToolEntry = {
  slug: string;
  status: ToolStatus;
  /**
   * The tool's own next-intl message namespace (e.g. "DofCalculator"),
   * which is where its `faq` array of {question, answer} items lives.
   * Used by the /faq page to pull every live tool's FAQ into one combined,
   * categorized page in addition to the tool's own page. Optional only for
   * a future "comingSoon" entry that has no page/namespace yet.
   */
  faqNamespace?: string;
};

export type ResolvedTool = ToolEntry & { name: string; description: string };

/**
 * Tool roster for the /tools hub, the homepage tools-highlights section
 * (`home-tools-highlights.tsx`), and the /faq page's per-tool FAQ
 * categories — single source of truth so a new tool only needs to be added
 * here once. New tools are built in the order agreed with the user
 * (photo-field calculators first, then post-shoot/pro tools); each one
 * flips from "comingSoon" to "live" once its own route ships. Sections
 * mirror the "use-case" grouping (field vs. post-shoot) already agreed for
 * exifnd.com's Guides categorization, per
 * claude/exiflens-tool-expansion-strategy-and-freeimgfix-benchmark.md.
 */
export const FIELD_TOOLS: ToolEntry[] = [
  { slug: "dof-calculator", status: "live", faqNamespace: "DofCalculator" },
  { slug: "exposure-stops-calculator", status: "live", faqNamespace: "ExposureCalculator" },
  { slug: "timelapse-calculator", status: "live", faqNamespace: "TimelapseCalculator" },
  { slug: "astrophotography-calculator", status: "live", faqNamespace: "AstroCalculator" },
  { slug: "bracketing-calculator", status: "live", faqNamespace: "BracketCalculator" },
];

export const POST_SHOOT_TOOLS: ToolEntry[] = [
  { slug: "print-resolution-calculator", status: "live", faqNamespace: "PrintResolutionCalculator" },
  { slug: "storage-calculator", status: "live", faqNamespace: "StorageCalculator" },
  { slug: "exif-remover", status: "live", faqNamespace: "ExifRemover" },
  { slug: "crop-factor-calculator", status: "live", faqNamespace: "CropFactorCalculator" },
];

/** All tools, field tools first, in the order the /tools hub itself lists them. */
export const ALL_TOOLS: ToolEntry[] = [...FIELD_TOOLS, ...POST_SHOOT_TOOLS];

export function getLiveTools(): ToolEntry[] {
  return ALL_TOOLS.filter((tool) => tool.status === "live");
}
