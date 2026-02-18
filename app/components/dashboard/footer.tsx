"use client";

import { FOOTER_YEAR } from "@/lib/site";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation("common");

  return (
    <>
      <div className="tea-line tea-line-bottom tea-page-padding" />
      <footer className="tea-page-padding flex items-center justify-between py-8">
        <p className="tea-text-muted tea-caps-10-wide">{t("footerTagline")}</p>
        <p className="tea-text-muted tea-caps-10-wide">{FOOTER_YEAR}</p>
      </footer>
    </>
  );
}
