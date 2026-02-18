"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import TeaLeafMark from "../icons/tea-leaf-mark";
import LanguageToggle from "../language-toggle";
import ThemeToggle from "../theme-toggle";

export default function Nav() {
  const { t } = useTranslation("landing");
  const { t: tc } = useTranslation("common");

  return (
    <header className="tea-page-padding reveal flex items-center justify-between py-4 sm:py-8">
      <div className="flex items-center gap-3">
        <TeaLeafMark />
        <span className="tea-text-primary text-sm font-medium tracking-[0.2em] uppercase">
          {tc("siteName")}
        </span>
      </div>
      <nav className="flex items-center md:gap-2" aria-label="Primary">
        <ThemeToggle />
        <LanguageToggle />
        <Link href="/auth" className="tea-link px-2">
          {t("signIn")}
        </Link>
      </nav>
    </header>
  );
}
