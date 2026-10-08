import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/**
 * 홈 하이라이트 영역(가이드·도구·블로그·FAQ) 아래의 "전체 보기" 버튼. 영역마다 제각각이던
 * 밑줄 텍스트 링크를 같은 윤곽선 버튼으로 통일했다. 라벨은 messages의 `…HighlightsCta`("… →").
 */
export function HomeSectionCta({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Button asChild variant="outline" size="sm" className="self-center">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
