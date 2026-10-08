import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * 홈 소개 문구 바로 아래의 짧은 신뢰 배지 줄(무료·가입 불필요·서버 전송 없음·언어 지원).
 * 문구는 messages `Home.trustBadges`(문자열 배열)에서 가져오며, 비어 있으면 그리지 않는다.
 */
export async function HomeTrustBadges() {
  const t = await getTranslations("Home");
  const badges = t.raw("trustBadges") as string[];
  if (!Array.isArray(badges) || badges.length === 0) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-2 pt-1">
      {badges.map((badge, index) => (
        <li
          key={badge}
          className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground ${
            // 모바일에서 한 줄에 들어가도록 마지막(가장 덜 중요한) 배지는 sm 미만에서 숨김
            index === badges.length - 1 ? "max-sm:hidden" : ""
          }`.trim()}
        >
          <Check aria-hidden="true" className="size-3.5 text-primary" />
          {badge}
        </li>
      ))}
    </ul>
  );
}
