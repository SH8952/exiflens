"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      value={locale}
      onValueChange={(next) => {
        // 블로그는 ko·en·ja 3개 언어(2026-11-05, 같은 글은 같은 주소 slug). 그 언어끼리는
        // 같은 글/목록으로 바꾸고, 블로그가 없는 언어(es)로 바꾸면 홈으로 이동한다.
        const blogLocales = ["ko", "en", "ja"];
        const target =
          pathname.startsWith("/blog") && !blogLocales.includes(next)
            ? "/"
            : pathname;
        router.replace(target, { locale: next as Locale });
      }}
    >
      <SelectTrigger size="sm" className="w-[84px]" aria-label="Language">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((l) => (
          <SelectItem key={l} value={l}>
            {localeLabels[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
