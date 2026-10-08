import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import * as runtime from "react/jsx-runtime";
import type { ComponentType } from "react";
import type { Locale } from "@/i18n/routing";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

export type GuideFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
  /**
   * Free-text category label, written in the guide's own locale (like
   * `tags`), used to group guides on the /guides index page. Older guides
   * written before this field existed may not have one — the guides index
   * falls back to a generic "Other" bucket for those (see
   * FALLBACK_CATEGORY in the guides page).
   */
  category?: string;
  /** Featured image path under /public (e.g. "/guides/images/{slug}.webp"), auto-attached at publish time. */
  image?: string;
  /** Unsplash photographer name, required for on-page attribution when `image` is set. */
  imageCredit?: string;
  /** Unsplash photographer profile URL (with UTM params), paired with `imageCredit`. */
  imageCreditUrl?: string;
};

export type GuideMeta = GuideFrontmatter & {
  slug: string;
  /** Rough reading time in minutes, derived from word count (~200 wpm). */
  readingMinutes: number;
};

type GuideImageAltMap = Record<string, Partial<Record<Locale, string>>>;
let guideImageAltCache: GuideImageAltMap | null = null;

/**
 * 가이드 대표 이미지의 설명(alt). `content/guides/image-alt.json`에 이미지 경로별·언어별로
 * 사진에 실제로 보이는 장면을 적어 두었다. 항목이 없으면(새로 발행된 글 등) `fallback`
 * (보통 글 제목)을 그대로 쓰므로 기존 동작과 같다. 글(mdx) 파일은 건드리지 않는다.
 */
export function getGuideImageAlt(
  locale: Locale,
  image: string | undefined,
  fallback: string,
): string {
  if (!image) return fallback;
  if (!guideImageAltCache) {
    try {
      guideImageAltCache = JSON.parse(
        fs.readFileSync(path.join(GUIDES_DIR, "image-alt.json"), "utf8"),
      ) as GuideImageAltMap;
    } catch {
      guideImageAltCache = {};
    }
  }
  return guideImageAltCache[image]?.[locale] || fallback;
}

/** 가이드 본문의 H2 소제목 하나(목차용). id는 rehype-slug가 붙인 앵커 id와 동일. */
export type GuideHeading = {
  id: string;
  text: string;
};

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function hastText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

/**
 * 목차용 H2 수집 플러그인. 반드시 rehypeSlug 뒤(= id가 이미 붙은 뒤)에, 그리고
 * rehypeAutolinkHeadings 앞에 둔다 — 앞에 두면 id가 없고, 뒤에 두면 앵커 아이콘이
 * 텍스트에 섞일 수 있다. 본문 HTML은 건드리지 않고 `headings` 배열에만 채운다.
 * H3(FAQ 질문 등)는 목차가 길어지므로 제외한다.
 */
function collectH2Headings(headings: GuideHeading[]) {
  return () => (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "h2") {
        const id = typeof node.properties?.id === "string" ? node.properties.id : "";
        const text = hastText(node).trim();
        if (id && text) headings.push({ id, text });
        return;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

function guideDir(locale: Locale) {
  return path.join(GUIDES_DIR, locale);
}

/** All published guide slugs for a locale, derived from the .mdx filenames present. */
export function getGuideSlugs(locale: Locale): string[] {
  const dir = guideDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function readRawSource(locale: Locale, slug: string): string {
  const filePath = path.join(guideDir(locale), `${slug}.mdx`);
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Reading time estimate. Space-delimited languages (en/es) use ~200 words per
 * minute. Japanese has no spaces between words, so counting whitespace-split
 * "words" collapsed every ja guide to 1 minute (2026-10-02 확인); ja and ko are
 * therefore measured in non-whitespace characters at ~500 characters per minute.
 */
function estimateReadingMinutes(body: string, locale: Locale): number {
  if (locale === "ja" || locale === "ko") {
    const chars = body.replace(/\s/g, "").length;
    return Math.max(1, Math.round(chars / 500));
  }
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Frontmatter + slug + reading time for one guide, without compiling the MDX body. */
export function getGuideMeta(locale: Locale, slug: string): GuideMeta | null {
  const filePath = path.join(guideDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as GuideFrontmatter;
  return {
    ...fm,
    slug,
    readingMinutes: estimateReadingMinutes(content, locale),
  };
}

/** All guides for a locale, sorted newest-first by publishedAt. */
export function getAllGuidesMeta(locale: Locale): GuideMeta[] {
  return getGuideSlugs(locale)
    .map((slug) => getGuideMeta(locale, slug))
    .filter((g): g is GuideMeta => g !== null)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/**
 * Up to `limit` other guides to link to from the bottom of a guide page.
 * Same-category guides are preferred (photographers reading an ND filter
 * guide are more likely to want another ND filter guide next); if there
 * aren't enough in the same category, the list is padded out with the
 * most recent guides from other categories.
 */
export function getRelatedGuides(
  locale: Locale,
  currentSlug: string,
  limit = 3,
): GuideMeta[] {
  const all = getAllGuidesMeta(locale).filter((g) => g.slug !== currentSlug);
  const current = getGuideMeta(locale, currentSlug);

  const sameCategory = all.filter((g) => g.category === current?.category);
  const rest = all.filter((g) => g.category !== current?.category);

  return [...sameCategory, ...rest].slice(0, limit);
}

/**
 * Compiles one guide's MDX body into a renderable React component. Called
 * from a server component (RSC) — @mdx-js/mdx's `evaluate` runs the MDX
 * compiler and hands back a ready-to-render `default` export, following the
 * standard mdx-js Next.js App Router integration pattern.
 */
export async function compileGuide(
  locale: Locale,
  slug: string,
): Promise<{
  Content: ComponentType<{ components?: Record<string, ComponentType<never>> }>;
  meta: GuideMeta;
  headings: GuideHeading[];
} | null> {
  const filePath = path.join(guideDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = readRawSource(locale, slug);
  const { data, content } = matter(raw);
  const fm = data as GuideFrontmatter;

  const headings: GuideHeading[] = [];

  const { default: Content } = await evaluate(content, {
    ...runtime,
    // singleTilde: false — 본문에서 "~"를 범위 표기(예: "f/11~f/16", "ISO 100~200")로
    // 자주 쓰는데, remark-gfm 기본값(singleTilde: true)은 "~" 하나만 있어도 취소선으로
    // 해석해 같은 문단의 두 "~" 사이가 통째로 취소선이 되고 "~" 문자도 사라지는
    // 버그가 있었음(2026-10-02 확인). "~~"(더블 틸드)로만 취소선을 인식하도록 제한.
    // flydronemap은 2026-09-28에 동일하게 수정함. 이 옵션을 제거하지 말 것.
    remarkPlugins: [[remarkGfm, { singleTilde: false }]],
    rehypePlugins: [rehypeSlug, collectH2Headings(headings), rehypeAutolinkHeadings],
  });

  return {
    Content: Content as ComponentType<{
      components?: Record<string, ComponentType<never>>;
    }>,
    meta: {
      ...fm,
      slug,
      readingMinutes: estimateReadingMinutes(content, locale),
    },
    headings,
  };
}
