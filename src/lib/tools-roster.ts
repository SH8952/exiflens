export type ToolStatus = "live" | "comingSoon";

export type ToolEntry = {
  slug: string;
  status: ToolStatus;
};

/**
 * Tool roster for the /tools hub AND the homepage tools-highlights section
 * (`home-tools-highlights.tsx`) — single source of truth so a new tool only
 * needs to be added here once. New tools are built in the order agreed with
 * the user (photo-field calculators first, then post-shoot/pro tools); each
 * one flips from "comingSoon" to "live" once its own route ships. Sections
 * mirror the "use-case" grouping (field vs. post-shoot) already agreed for
 * exifnd.com's Guides categorization, per
 * claude/exiflens-tool-expansion-strategy-and-freeimgfix-benchmark.md.
 */
export const FIELD_TOOLS: ToolEntry[] = [
  { slug: "dof-calculator", status: "live" },
  { slug: "exposure-stops-calculator", status: "live" },
  { slug: "timelapse-calculator", status: "live" },
  { slug: "astrophotography-calculator", status: "live" },
  { slug: "bracketing-calculator", status: "live" },
];

export const POST_SHOOT_TOOLS: ToolEntry[] = [
  { slug: "print-resolution-calculator", status: "live" },
  { slug: "storage-calculator", status: "live" },
  { slug: "exif-remover", status: "live" },
  { slug: "crop-factor-calculator", status: "live" },
];

/** All tools, field tools first, in the order the /tools hub itself lists them. */
export const ALL_TOOLS: ToolEntry[] = [...FIELD_TOOLS, ...POST_SHOOT_TOOLS];

export function getLiveTools(): ToolEntry[] {
  return ALL_TOOLS.filter((tool) => tool.status === "live");
}
