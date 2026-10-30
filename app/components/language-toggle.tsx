"use client";

import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n, t } = useTranslation("common");
  const isEnglish = i18n.language === "en";

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(isEnglish ? "zh" : "en")}
      className="icon-btn h-10 min-w-10 px-2 text-sm whitespace-nowrap sm:h-9 sm:min-w-9"
      aria-label={t("switchLanguage")}
      title={t("switchLanguage")}
      lang={isEnglish ? "zh" : "en"}
    >
      {isEnglish ? "中文" : "EN"}
    </button>
  );
}
