/**
 * - "live": 공개됨 (허브·홈·FAQ·사이트맵에 노출, 페이지 접속 가능)
 * - "comingSoon": 허브에 '준비 중' 카드로만 노출
 * - "hidden": 구현은 끝났지만 아직 공개하지 않음. 허브/홈/FAQ/사이트맵 어디에도
 *   나오지 않고, 운영 환경에서는 페이지 주소로 직접 들어와도 404를 반환한다.
 *   (개발 환경 `npm run dev`에서만 확인용으로 보인다.) 공개할 때는 이 값을
 *   "live"로 한 줄 바꾸고 푸시하면 된다.
 */
export type ToolStatus = "live" | "comingSoon" | "hidden";

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
  { slug: "dof-hyperfocal-table", status: "live", faqNamespace: "DofHyperfocalTable" },
  { slug: "sunny-16-calculator", status: "live", faqNamespace: "Sunny16Calculator" },
  { slug: "golden-hour-calculator", status: "live", faqNamespace: "GoldenHourCalculator" },
  { slug: "advanced-dof-diffraction-calculator", status: "live", faqNamespace: "AdvancedDofDiffractionCalculator" },
  { slug: "camera-fov-calculator", status: "live", faqNamespace: "CameraFovCalculator" },
  { slug: "flash-guide-number-calculator", status: "live", faqNamespace: "FlashGuideNumberCalculator" },
];

export const POST_SHOOT_TOOLS: ToolEntry[] = [
  { slug: "print-resolution-calculator", status: "live", faqNamespace: "PrintResolutionCalculator" },
  { slug: "storage-calculator", status: "live", faqNamespace: "StorageCalculator" },
  { slug: "exif-remover", status: "live", faqNamespace: "ExifRemover" },
  { slug: "crop-factor-calculator", status: "live", faqNamespace: "CropFactorCalculator" },
  { slug: "shutter-count-checker", status: "live", faqNamespace: "ShutterCountChecker" },
];

/**
 * 이미지 편집 · 변환 도구 — 사진 전문 영역이 아니라 직장인·학생·일반 사용자가
 * 보고서/블로그/제출용 이미지를 빠르게 손보는 용도. 모든 처리는 브라우저 안에서
 * 이루어지며 이미지는 서버로 전송되지 않는다.
 * 공개 순서: 이미지 압축 먼저 → 나머지는 hidden 상태로 두었다가 순차 공개.
 */
export const IMAGE_TOOLS: ToolEntry[] = [
  { slug: "image-compressor", status: "live", faqNamespace: "ImageCompressor" },
  { slug: "image-resizer", status: "hidden", faqNamespace: "ImageResizer" },
  { slug: "image-converter", status: "hidden", faqNamespace: "ImageConverter" },
  { slug: "image-crop-rotate", status: "hidden", faqNamespace: "ImageCropRotate" },
  { slug: "image-watermark", status: "hidden", faqNamespace: "ImageWatermark" },
  { slug: "image-mosaic", status: "hidden", faqNamespace: "ImageMosaic" },
];

/** All tools, field tools first, in the order the /tools hub itself lists them. */
export const ALL_TOOLS: ToolEntry[] = [
  ...FIELD_TOOLS,
  ...POST_SHOOT_TOOLS,
  ...IMAGE_TOOLS,
];

export function getLiveTools(): ToolEntry[] {
  return ALL_TOOLS.filter((tool) => tool.status === "live");
}

/** 허브·FAQ 등 목록에 보여 줄 도구만 추린다. hidden은 개발 환경에서만 포함. */
export function getVisibleTools(tools: ToolEntry[]): ToolEntry[] {
  const isDev = process.env.NODE_ENV === "development";
  return tools.filter((tool) => tool.status !== "hidden" || isDev);
}

/** 도구 페이지 접속 가능 여부 (live, 또는 개발 환경의 hidden). */
export function isToolAccessible(slug: string): boolean {
  const tool = ALL_TOOLS.find((t) => t.slug === slug);
  if (!tool) return false;
  if (tool.status === "live") return true;
  return process.env.NODE_ENV === "development";
}

/** 사이트맵에 넣을 공개(live) 이미지 도구 경로. */
export function getLiveImageToolPaths(): string[] {
  return IMAGE_TOOLS.filter((t) => t.status === "live").map(
    (t) => `/tools/${t.slug}`,
  );
}
