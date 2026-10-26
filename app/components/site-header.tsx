"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import SealMark from "./brand/seal-mark";
import LanguageToggle from "./language-toggle";
import ThemeToggle from "./theme-toggle";

export default function SiteHeader({ action }: { action?: ReactNode }) {
  const { t } = useTranslation("common");

  return (
    <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:gap-6 sm:px-8 lg:px-12">
      <Link
        href="/"
        aria-label={t("siteName")}
        className="tap-target relative flex shrink-0 items-center gap-2.5 font-kai text-xl whitespace-nowrap text-text"
      >
        <SealMark />
        <span className="max-[359px]:hidden">{t("siteName")}</span>
      </Link>
      <nav
        aria-label={t("siteName")}
        className="flex shrink-0 items-center gap-0.5 sm:gap-1"
      >
        <LanguageToggle />
        <ThemeToggle />
        {action}
      </nav>
    </header>
  );
}
