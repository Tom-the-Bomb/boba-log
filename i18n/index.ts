import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import authMessages from "./messages/auth.json";
import commonMessages from "./messages/common.json";
import dashboardMessages from "./messages/dashboard.json";
import landingMessages from "./messages/landing.json";
import notFoundMessages from "./messages/not-found.json";

const LOCALE_STORAGE_KEY = "boba_locale";

function getSavedLocale(): string {
  if (typeof window === "undefined") {
    return "en";
  }
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "en" || stored === "zh") {
    return stored;
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonMessages.en,
      landing: landingMessages.en,
      auth: authMessages.en,
      dashboard: dashboardMessages.en,
      "not-found": notFoundMessages.en,
    },
    zh: {
      common: commonMessages.zh,
      landing: landingMessages.zh,
      auth: authMessages.zh,
      dashboard: dashboardMessages.zh,
      "not-found": notFoundMessages.zh,
    },
  },
  lng: getSavedLocale(),
  fallbackLng: "en",
  defaultNS: "common",
  fallbackNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  }
});

export default i18n;
