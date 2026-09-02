/**
 * 개발자 전용 가이드 이미지 관리 도구의 서버 로직.
 *
 * automation/attach-guide-image.py(발행 시 자동 첨부)와 같은 Unsplash API를
 * 쓰지만, 이 파일은 로컬 개발 서버(`npm run dev`)에서만 동작하는 수동 교체
 * 도구용이다. `/api/dev/*` 라우트에서만 import되고, 그 라우트들은 각각
 * NODE_ENV가 "development"가 아니면 즉시 403을 반환하므로 프로덕션에서는
 * 실행될 일이 없다. (Next.js가 프로덕션 빌드 시 이 코드 자체를 트리셰이킹
 * 하지 못하더라도, 라우트 진입점에서 이중으로 막혀 있다.)
 *
 * 사이트를 운영하는 동안 계속 쓰는 상시 도구이므로 1회성 스크립트처럼
 * 지우지 않는다.
 */
import fs from "node:fs";
import path from "node:path";

export const GUIDE_LOCALES = ["en", "ja", "ko", "es"] as const;

export type UnsplashCandidate = {
  id: string;
  thumbUrl: string;
  rawUrl: string;
  downloadLocation: string | null;
  photographerName: string;
  photographerUrl: string;
};

export class DevImageToolError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function getAccessKey(): string {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    throw new DevImageToolError(
      "UNSPLASH_ACCESS_KEY가 설정되어 있지 않습니다 (.env.local 확인)",
      500,
    );
  }
  return key;
}

/** 검색어로 Unsplash 후보 이미지 목록(썸네일)을 가져온다. 다운로드/파일 저장은 하지 않는다. */
export async function searchGuideImageCandidates(
  query: string,
  count = 9,
): Promise<UnsplashCandidate[]> {
  const accessKey = getAccessKey();
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(count));
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("content_filter", "high");

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new DevImageToolError(`Unsplash 검색 실패 (${res.status})`, 502);
  }
  const data = await res.json();
  const results: unknown[] = Array.isArray(data?.results) ? data.results : [];

  return results.map((raw): UnsplashCandidate => {
    const p = raw as {
      id: string;
      urls: { small: string; raw: string };
      links: { download_location?: string };
      user: { name: string; links: { html: string } };
    };
    const utm = "utm_source=ExifLens&utm_medium=referral";
    const sep = p.user.links.html.includes("?") ? "&" : "?";
    return {
      id: p.id,
      thumbUrl: p.urls.small,
      rawUrl: p.urls.raw,
      downloadLocation: p.links.download_location ?? null,
      photographerName: p.user.name,
      photographerUrl: `${p.user.links.html}${sep}${utm}`,
    };
  });
}

/** 후보 하나를 실제로 선택했을 때: 다운로드 추적 → 이미지 저장 → 4개 언어 frontmatter 갱신. */
export async function applyGuideImage(
  slug: string,
  candidate: UnsplashCandidate,
): Promise<{ image: string; imageCredit: string; imageCreditUrl: string; updatedLocales: string[] }> {
  const accessKey = getAccessKey();

  // Unsplash API 가이드라인: 실제 사용(적용) 시점에만 download_location 호출.
  // 검색 결과를 보여주는 시점(searchGuideImageCandidates)에는 호출하지 않는다.
  if (candidate.downloadLocation) {
    try {
      await fetch(candidate.downloadLocation, {
        headers: { Authorization: `Client-ID ${accessKey}` },
      });
    } catch {
      // 다운로드 추적 실패는 치명적이지 않으므로 무시하고 계속 진행한다.
    }
  }

  const imageUrl = `${candidate.rawUrl}&w=1600&q=80&fm=webp&fit=crop`;
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new DevImageToolError("이미지 다운로드 실패", 502);
  }
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  const repoRoot = process.cwd();
  const imagesDir = path.join(repoRoot, "public", "guides", "images");
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.writeFileSync(path.join(imagesDir, `${slug}.webp`), buffer);

  const imageData = {
    image: `/guides/images/${slug}.webp`,
    imageCredit: candidate.photographerName,
    imageCreditUrl: candidate.photographerUrl,
  };

  const updatedLocales: string[] = [];
  for (const locale of GUIDE_LOCALES) {
    const mdxPath = path.join(repoRoot, "content", "guides", locale, `${slug}.mdx`);
    if (!fs.existsSync(mdxPath)) continue;

    const text = fs.readFileSync(mdxPath, "utf-8");
    const parts = text.split("---");
    if (parts.length < 3) continue;

    // 기존 image/imageCredit/imageCreditUrl 줄이 있으면 제거하고 새 값으로 교체.
    let fm = parts[1];
    fm = fm
      .replace(/^image:.*\n?/m, "")
      .replace(/^imageCredit:.*\n?/m, "")
      .replace(/^imageCreditUrl:.*\n?/m, "");
    fm = fm.replace(/\n?$/, "\n");
    fm +=
      `image: "${imageData.image}"\n` +
      `imageCredit: "${imageData.imageCredit}"\n` +
      `imageCreditUrl: "${imageData.imageCreditUrl}"\n`;

    parts[1] = fm;
    fs.writeFileSync(mdxPath, parts.join("---"), "utf-8");
    updatedLocales.push(locale);
  }

  return { ...imageData, updatedLocales };
}
