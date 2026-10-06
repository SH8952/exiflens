import { getTranslations } from "next-intl/server";
import type { GuideHeading } from "@/lib/guides";

/**
 * 가이드 상단 목차(H2 소제목 링크 목록).
 *
 * 목적: 구글 검색결과의 섹션 바로가기 링크가 나타날 가능성을 높이는 것.
 * 구글 안내상 본문이 접이식/탭 안에 숨어 있으면 불리하므로, 접지 않고 항상
 * 펼쳐 둔다(<details> 사용 금지). 소제목이 2개 미만이면 목차가 의미 없으므로 그리지 않는다.
 * 링크는 같은 페이지의 #앵커이므로 자바스크립트가 필요 없다.
 */
export async function GuideToc({ headings }: { headings: GuideHeading[] }) {
  if (headings.length < 2) return null;
  const t = await getTranslations("Guides");

  return (
    <nav
      aria-label={t("toc")}
      className="rounded-lg border border-border bg-muted/30 p-4"
    >
      <p className="mb-2 text-sm font-semibold tracking-tight">{t("toc")}</p>
      <ol className="list-decimal pl-5 text-sm marker:text-muted-foreground sm:columns-2 sm:gap-x-8">
        {headings.map((heading) => (
          <li key={heading.id} className="break-inside-avoid py-0.5">
            <a
              href={`#${heading.id}`}
              className="text-primary hover:underline"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
