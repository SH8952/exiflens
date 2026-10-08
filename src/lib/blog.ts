import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import * as runtime from "react/jsx-runtime";
import type { ComponentType } from "react";

/**
 * 블로그(/ko/blog) 콘텐츠 로더 — 2026-10-02 신설.
 *
 * 가이드(`content/guides/<locale>/`)와 별도 영역이다. 가이드는 정보 전달 중심,
 * 블로그는 롱테일·에버그린 주제를 다루는 글(운영자의 실제 경험 메모 + 보강)이다.
 *
 * 한국어 전용: 글은 `content/blog/ko/<slug>.mdx` 한 벌만 둔다. 다른 언어(en/ja/es)
 * 화면의 "블로그" 메뉴는 이 한국어 주소로 연결되고, /en/blog 등으로 직접 들어오면
 * /ko/blog 로 리디렉션된다(중복 URL·빈 목록 페이지로 인한 얇은 콘텐츠 방지).
 * 나중에 다른 언어를 추가하려면 BLOG_LOCALES 에 추가하고 해당 폴더를 만든다.
 */
export const BLOG_LOCALES = ["ko"] as const;
export type BlogLocale = (typeof BLOG_LOCALES)[number];
export const BLOG_LOCALE: BlogLocale = "ko";

export function isBlogLocale(locale: string): locale is BlogLocale {
  return (BLOG_LOCALES as readonly string[]).includes(locale);
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
  /** 글 분류 라벨(자유 텍스트). 같은 분류의 글이 관련 글로 우선 노출된다. */
  category?: string;
  /** /public 아래 대표 이미지 경로(선택). 글 상세 페이지 맨 위에 크게 표시된다. */
  image?: string;
  /** 목록 카드·공유 미리보기(og:image)용 썸네일 경로(선택, 3:2 권장). 글 상세 페이지 본문에는 표시되지 않는다. */
  thumbnail?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
};

export type BlogMeta = BlogFrontmatter & {
  slug: string;
  /** 읽는 시간(분). 한국어는 공백 제외 글자 수 ÷ 500. */
  readingMinutes: number;
};

/**
 * 예약 발행 — 2026-10-07. `publishedAt`(YYYY-MM-DD)이 한국 시간(Asia/Seoul) 오늘보다 미래인 글은
 * 아직 공개하지 않는다(목록·글 주소·사이트맵·RSS·관련 글 모두 제외, 글 주소 직접 접근은 404).
 * 한국 시간 기준 해당 날짜 0시부터 공개된다. 로컬 개발 서버(`npm run dev`)에서는 미리보기를 위해
 * 예약 글도 보인다. 블로그 목록·글 상세·목록 2페이지 이후·RSS는 요청 때마다 만들어지므로 날짜가 되면 바로 공개되고,
 * 사이트맵은 배포할 때 만들어지므로 그 뒤 첫 배포부터 예약 글이 반영된다.
 * 날짜 형식이 올바르지 않으면 안전하게 공개한다(기존 글이 사라지는 사고 방지).
 */
export function isBlogPublished(publishedAt: string, now: Date = new Date()): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const day = String(publishedAt ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return true;
  const todayKst = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return day <= todayKst;
}

function blogDir() {
  return path.join(BLOG_DIR, BLOG_LOCALE);
}

/** 공개된 글의 slug 목록(예약 글 제외). */
export function getBlogSlugs(): string[] {
  const dir = blogDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .filter((slug) => getBlogMeta(slug) !== null);
}

function estimateReadingMinutes(body: string): number {
  const chars = body.replace(/\s/g, "").length;
  return Math.max(1, Math.round(chars / 500));
}

export function getBlogMeta(slug: string): BlogMeta | null {
  const filePath = path.join(blogDir(), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as BlogFrontmatter;
  if (!isBlogPublished(fm.publishedAt)) return null;
  return {
    ...fm,
    slug,
    readingMinutes: estimateReadingMinutes(content),
  };
}

/** 최신 글이 먼저 오도록 publishedAt 내림차순. */
export function getAllBlogMeta(): BlogMeta[] {
  return getBlogSlugs()
    .map((slug) => getBlogMeta(slug))
    .filter((p): p is BlogMeta => p !== null)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/** 목록 한 페이지에 보여줄 글 수(PC 기준 4열 × 3줄). 넘으면 하단에 1, 2, 3… 페이지로 나뉜다. */
export const BLOG_PAGE_SIZE = 12;

export function getBlogPage(page: number): {
  posts: BlogMeta[];
  totalPages: number;
  total: number;
} {
  const all = getAllBlogMeta();
  const totalPages = Math.max(1, Math.ceil(all.length / BLOG_PAGE_SIZE));
  return {
    posts: all.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE),
    totalPages,
    total: all.length,
  };
}

/** 같은 분류 글을 우선, 모자라면 최신 글로 채운다. */
export function getRelatedBlogPosts(currentSlug: string, limit = 3): BlogMeta[] {
  const all = getAllBlogMeta().filter((p) => p.slug !== currentSlug);
  const current = getBlogMeta(currentSlug);
  const sameCategory = all.filter(
    (p) => current?.category && p.category === current.category,
  );
  const rest = all.filter((p) => !sameCategory.includes(p));
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function compileBlogPost(
  slug: string,
): Promise<{
  Content: ComponentType<{ components?: Record<string, ComponentType<never>> }>;
  meta: BlogMeta;
} | null> {
  const filePath = path.join(blogDir(), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as BlogFrontmatter;
  if (!isBlogPublished(fm.publishedAt)) return null;

  const { default: Content } = await evaluate(content, {
    ...runtime,
    // singleTilde: false — 가이드와 동일. "~"를 범위 표기(예: "f/11~f/16")로 쓰는데
    // remark-gfm 기본값은 "~" 하나로도 취소선이 되어 문장이 깨진다(2026-10-02 가이드에서
    // 확인된 버그). 이 옵션을 제거하지 말 것.
    remarkPlugins: [[remarkGfm, { singleTilde: false }]],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  });

  return {
    Content: Content as ComponentType<{
      components?: Record<string, ComponentType<never>>;
    }>,
    meta: {
      ...fm,
      slug,
      readingMinutes: estimateReadingMinutes(content),
    },
  };
}
