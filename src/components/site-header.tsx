import Link from "next/link";
import { useTranslations } from "next-intl";
import { Aperture } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SiteHeader() {
  const t = useTranslations("Header");

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Aperture className="size-6 text-primary" />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight">
              ExifLens
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              {t("tagline")}
            </span>
          </span>
        </Link>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
