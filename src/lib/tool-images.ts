import toolImagesData from "@/data/tool-images.json";

export type ToolImageSlot = "left" | "right";

export type ToolImageMeta = {
  image: string;
  imageCredit?: string;
  imageCreditUrl?: string;
};

type ToolImagesMap = Record<string, Partial<Record<ToolImageSlot, ToolImageMeta>>>;

const DATA = toolImagesData as ToolImagesMap;

/**
 * Shared example-image metadata for a calculator tool page, keyed by the
 * tool's slug and left/right position. Backed by `src/data/tool-images.json`,
 * which the developer image tool (`src/components/dev/tool-image-dev-panel.tsx`)
 * writes to. Unlike guide articles (mdx frontmatter per locale), tool pages
 * share one photo across all locales, so this is a single, non-localized
 * JSON file rather than per-locale content.
 *
 * Missing slots are returned as `undefined` rather than throwing, so a tool
 * page can use <ToolExampleImages> before its photos are set without
 * breaking — it simply renders nothing until images exist.
 */
export function getToolImages(slug: string): Partial<Record<ToolImageSlot, ToolImageMeta>> {
  return DATA[slug] ?? {};
}
