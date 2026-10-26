"use client";

import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n, t } = useTranslation("common");
  const isEnglish = i18n.language === "en";

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(isEnglish ? "zh" : "en")}
      className="tap-target relative grid h-10 min-w-10 place-items-center rounded-md px-2 text-sm whitespace-nowrap text-text-2 hover:bg-hover hover:text-text sm:h-9 sm:min-w-9"
      aria-label={t("switchLanguage")}
      title={t("switchLanguage")}
      lang={isEnglish ? "zh" : "en"}
    >
      {isEnglish ? "中文" : "EN"}
    </button>
  );
}
