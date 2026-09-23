/**
 * 개발자 전용 "계산기 도구 예시 이미지" 관리 도구의 서버 로직.
 *
 * 가이드 아티클의 대표 이미지 관리 도구(`src/lib/dev/guide-image-tool.ts`)와
 * 같은 Unsplash 검색 함수(`searchGuideImageCandidates`)를 그대로 재사용한다 -
 * 검색 자체는 가이드/도구 구분 없이 동일한 로직이기 때문. 다만 저장 방식은
 * 다르다: 가이드는 mdx frontmatter(언어별)에 저장하지만, 계산기 도구
 * 페이지는 mdx가 없고 언어와 무관하게 사진 1장을 공유하므로
 * `src/data/tool-images.json` 한 곳에 slug + 위치(left/right) 기준으로
 * 저장한다. 모든 계산기 도구 페이지가 공통으로 쓰는 <ToolExampleImages>
 * 템플릿의 데이터 소스가 이 파일이다.
 *
 * `/api/dev/tool-image-*` 라우트에서만 import되고, 그 라우트들은 각각
 * NODE_ENV가 "development"가 아니면 즉시 403을 반환하므로 프로덕션에서는
 * 실행될 일이 없다. 1회성 스크립트가 아니라 사이트를 운영하는 동안 계속
 * 쓰는 상시 도구이므로 임의로 삭제하지 않는다.
 */
import fs from "node:fs";
import path from "node:path";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  DevImageToolError,
  MAX_UPLOAD_BYTES,
  searchGuideImageCandidates,
  type UnsplashCandidate,
} from "@/lib/dev/guide-image-tool";
import type { ToolImageMeta, ToolImageSlot } from "@/lib/tool-images";

export { searchGuideImageCandidates as searchToolImageCandidates, DevImageToolError };
export type { UnsplashCandidate };

const DATA_PATH = path.join(process.cwd(), "src", "data", "tool-images.json");
const IMAGES_DIR = path.join(process.cwd(), "public", "tools", "images");

type ToolImagesFile = Record<string, Partial<Record<ToolImageSlot, ToolImageMeta>>>;

function readData(): ToolImagesFile {
  if (!fs.existsSync(DATA_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writeData(data: ToolImagesFile) {
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

/** 기존 {slug}-{slot}.* 이미지 파일을 지운다 (확장자가 바뀌는 경우 이전 파일이 남지 않도록). */
function removeExistingToolImage(slug: string, slot: ToolImageSlot) {
  if (!fs.existsSync(IMAGES_DIR)) return;
  const prefix = `${slug}-${slot}.`;
  for (const file of fs.readdirSync(IMAGES_DIR)) {
    if (file.startsWith(prefix)) {
      fs.unlinkSync(path.join(IMAGES_DIR, file));
    }
  }
}

/** Unsplash 후보 하나를 선택했을 때: 다운로드 추적 → 이미지 저장 → tool-images.json 갱신. */
export async function applyToolImage(
  slug: string,
  slot: ToolImageSlot,
  candidate: UnsplashCandidate,
): Promise<ToolImageMeta> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new DevImageToolError(
      "UNSPLASH_ACCESS_KEY가 설정되어 있지 않습니다 (.env.local 확인)",
      500,
    );
  }

  // Unsplash API 가이드라인: 실제 사용(적용) 시점에만 download_location 호출.
  if (candidate.downloadLocation) {
    try {
      await fetch(candidate.downloadLocation, {
        headers: { Authorization: `Client-ID ${accessKey}` },
      });
    } catch {
      // 다운로드 추적 실패는 치명적이지 않으므로 무시하고 계속 진행한다.
    }
  }

  const imageUrl = `${candidate.rawUrl}&w=1200&q=80&fm=webp&fit=crop`;
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new DevImageToolError("이미지 다운로드 실패", 502);
  }
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  removeExistingToolImage(slug, slot);
  fs.writeFileSync(path.join(IMAGES_DIR, `${slug}-${slot}.webp`), buffer);

  const meta: ToolImageMeta = {
    image: `/tools/images/${slug}-${slot}.webp`,
    imageCredit: candidate.photographerName,
    imageCreditUrl: candidate.photographerUrl,
  };

  const data = readData();
  data[slug] = { ...data[slug], [slot]: meta };
  writeData(data);

  return meta;
}

/**
 * 개발자가 직접 촬영/보유한 사진 파일을 그대로 적용한다. Unsplash 저작자
 * 표기가 필요 없으므로 imageCredit/imageCreditUrl은 쓰지 않고(기존 값이
 * 있었다면 제거), image 경로만 갱신한다.
 */
export async function applyUploadedToolImage(
  slug: string,
  slot: ToolImageSlot,
  buffer: Buffer,
  extension: string,
): Promise<ToolImageMeta> {
  const ext = extension.toLowerCase().replace(/^\./, "");
  if (!(ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext)) {
    throw new DevImageToolError(
      `지원하지 않는 파일 형식입니다 (허용: ${ALLOWED_UPLOAD_EXTENSIONS.join(", ")})`,
      400,
    );
  }
  if (buffer.byteLength === 0) {
    throw new DevImageToolError("빈 파일입니다.", 400);
  }
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new DevImageToolError(
      `파일이 너무 큽니다 (최대 ${Math.floor(MAX_UPLOAD_BYTES / 1024 / 1024)}MB)`,
      400,
    );
  }

  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  removeExistingToolImage(slug, slot);
  fs.writeFileSync(path.join(IMAGES_DIR, `${slug}-${slot}.${ext}`), buffer);

  const meta: ToolImageMeta = { image: `/tools/images/${slug}-${slot}.${ext}` };

  const data = readData();
  data[slug] = { ...data[slug], [slot]: meta };
  writeData(data);

  return meta;
}
