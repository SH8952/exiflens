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
        // 블로그는 한국어 전용이라 /en/blog 등은 /ko/blog 로 되돌아간다(언어를
        // 못 바꾸는 것처럼 보임). 블로그 화면에서 언어를 바꾸면 해당 언어 홈으로 이동.
        const target = pathname.startsWith("/blog") ? "/" : pathname;
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
