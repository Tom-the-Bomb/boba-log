"use client";

import { AUTHOR_NAME, FOOTER_YEAR } from "@/lib/site";
import { useTranslation } from "react-i18next";

export default function SiteFooter() {
  const { t } = useTranslation("common");

  return (
    <footer className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
      <div className="flex items-center justify-between gap-4 border-t border-rule py-6 text-sm text-text-2">
        <p>{t("footerTagline", { author: AUTHOR_NAME })}</p>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/Tom-the-Bomb/boba-log"
            className="tap-target relative hover:text-text hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {t("sourceOnGitHub")}
          </a>
          <span className="num">{FOOTER_YEAR}</span>
        </div>
      </div>
    </footer>
  );
}
