"use client";

import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === "en";

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(isEnglish ? "zh" : "en")}
      className="tea-icon-btn text-xs font-medium"
      aria-label={isEnglish ? "Switch to Chinese" : "Switch to English"}
      title={isEnglish ? "EN" : "中文"}
    >
      {isEnglish ? "EN" : "中文"}
    </button>
  );
}
