import toolImages from "@/data/tool-images.json";
import {
  SITE_URL,
  DEFAULT_OG_IMAGES,
  DEFAULT_TWITTER_IMAGES,
} from "@/lib/seo";

/**
 * 도구 페이지의 공유 미리보기(OG/트위터 카드) 이미지.
 * - 도구 예시 사진이 있는 도구(src/data/tool-images.json)는 그 사진을 1200×630으로 잘라 만든
 *   public/og/tools/<slug>.jpg 를 쓴다. (JPEG: 메신저·SNS 호환성이 가장 넓음)
 * - 없는 도구는 사이트 기본 이미지(og-default.png)로 되돌린다.
 * 새 도구 사진을 추가했다면 같은 방식으로 public/og/tools/<slug>.jpg 를 만들어 두면 자동 적용된다.
 */
export function toolSocialImages(slug: string, alt: string) {
  if (!(slug in toolImages)) {
    return { og: DEFAULT_OG_IMAGES, twitter: DEFAULT_TWITTER_IMAGES };
  }
  const url = `${SITE_URL}/og/tools/${slug}.jpg`;
  return {
    og: [{ url, width: 1200, height: 630, alt }],
    twitter: [url],
  };
}
