"use client";

import { FOOTER_YEAR } from "@/lib/site";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="tea-page-padding reveal reveal-d5 flex items-center justify-between py-5 sm:py-8">
      <p className="tea-text-muted tea-caps-10 sm:tracking-[0.25em]">
        {t("footerTagline")}
      </p>
      <p className="tea-text-muted tea-caps-10 sm:tracking-[0.25em]">
        {FOOTER_YEAR}
      </p>
    </footer>
  );
}
