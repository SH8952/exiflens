"use client";

import { useState } from "react";
import { Aperture, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function SiteHeader() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const onFramePage = pathname === "/frame";
  const [menuOpen, setMenuOpen] = useState(false);

  const frameLink = (
    <Link
      href={onFramePage ? "/" : "/frame"}
      className={navLinkClass}
      onClick={() => setMenuOpen(false)}
    >
      {/*
        Same nav slot toggles its destination based on the current page:
        "Frame Generator" navigates there from the home page, and while
        already on the frame page it becomes "ExifLens" to navigate back
        — a single, obvious way back to the home page from where the
        user clicked in, instead of relying only on the logo at far left.
      */}
      {onFramePage ? "ExifLens" : t("frameNav")}
    </Link>
  );

  return (
    <header className="relative border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Aperture className="size-6 text-primary" />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight">
              ExifLens
            </span>
            {/* 2026-10-02: 블로그 메뉴가 늘어 sm~lg 구간에서 메뉴가 줄바꿈/넘침이 생겨
                태그라인 표시를 sm → lg 로 올리고 메뉴 간격을 좁힘(gap-3 lg:gap-4). */}
            <span className="hidden text-xs text-muted-foreground lg:block">
              {t("tagline")}
            </span>
          </span>
        </Link>

        {/* Desktop nav: full width is available, so every link stays on one line */}
        <nav className="hidden items-center gap-3 sm:flex lg:gap-4">
          <Link href="/about" className={navLinkClass}>
            {t("aboutNav")}
          </Link>
          <Link href="/guides" className={navLinkClass}>
            {t("guidesNav")}
          </Link>
          <Link href="/faq" className={navLinkClass}>
            {t("faqNav")}
          </Link>
          {/* 블로그는 한국어 전용(/ko/blog) — 모든 언어 화면에서 한국어 블로그로 연결 */}
          <Link href="/blog" locale="ko" className={navLinkClass}>
            {t("blogNav")}
          </Link>
          <Link href="/tools" className={navLinkClass}>
            {t("toolsNav")}
          </Link>
          {frameLink}
          <LanguageSwitcher />
        </nav>

        {/* Mobile: not enough width for 4 text links + language select without
            wrapping onto two lines, so they collapse into a hamburger menu */}
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {menuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="flex flex-col border-t border-border px-4 py-2 sm:hidden">
          <Link
            href="/about"
            className={`${navLinkClass} py-2.5`}
            onClick={() => setMenuOpen(false)}
          >
            {t("aboutNav")}
          </Link>
          <Link
            href="/guides"
            className={`${navLinkClass} py-2.5`}
            onClick={() => setMenuOpen(false)}
          >
            {t("guidesNav")}
          </Link>
          <Link
            href="/faq"
            className={`${navLinkClass} py-2.5`}
            onClick={() => setMenuOpen(false)}
          >
            {t("faqNav")}
          </Link>
          <Link
            href="/blog"
            locale="ko"
            className={`${navLinkClass} py-2.5`}
            onClick={() => setMenuOpen(false)}
          >
            {t("blogNav")}
          </Link>
          <Link
            href="/tools"
            className={`${navLinkClass} py-2.5`}
            onClick={() => setMenuOpen(false)}
          >
            {t("toolsNav")}
          </Link>
          <span className="py-2.5">{frameLink}</span>
        </nav>
      ) : null}
    </header>
  );
}
