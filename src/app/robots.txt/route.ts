import { SITE_URL } from "@/lib/seo";

// robots.txt를 직접 만들어 응답한다.
// 기존 src/app/robots.ts(MetadataRoute.Robots)는 주석 줄을 출력할 수 없어서 대체했다.
// 규칙은 기존과 동일: 모든 크롤러 허용, /api/ 차단, 사이트맵 안내.
// 마지막 주석 줄은 Daum 웹마스터도구 소유 확인용 PIN 코드다(규칙에 영향 없음).
// 인증이 끝난 뒤에도 지우지 말 것(지우면 인증이 풀릴 수 있음).

export const dynamic = "force-static";

const DAUM_WEBMASTER_PIN =
  "#DaumWebMasterTool:95cc2d13bd7bdec74e6deef29e6f239b5140a47fed8560d4a626375a8592f834:nmRPv+AMqgHpYd33WRjhZA==";

export function GET() {
  const body = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
    DAUM_WEBMASTER_PIN,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
