"use client";

import { Aperture } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SiteHeader() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const onFramePage = pathname === "/frame";

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

        <nav className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("aboutNav")}
          </Link>
          <Link
            href="/guides"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("guidesNav")}
          </Link>
          <Link
            href="/faq"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("faqNav")}
          </Link>

          {/*
            Same nav slot toggles its destination based on the current page:
            "Frame Generator" navigates there from the home page, and while
            already on the frame page it becomes "ExifLens" to navigate back
            — a single, obvious way back to the home page from where the
            user clicked in, instead of relying only on the logo at far left.
          */}
          <Link
            href={onFramePage ? "/" : "/frame"}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {onFramePage ? "ExifLens" : t("frameNav")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
