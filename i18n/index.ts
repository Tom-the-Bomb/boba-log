import { createInstance, type i18n as I18n } from "i18next";
import { initReactI18next } from "react-i18next";

import authMessages from "./messages/auth.json";
import commonMessages from "./messages/common.json";
import dashboardMessages from "./messages/dashboard.json";
import landingMessages from "./messages/landing.json";
import notFoundMessages from "./messages/not-found.json";

import type { Locale } from "./locale";

export function createI18n(locale: Locale): I18n {
  const instance = createInstance();
  instance.use(initReactI18next).init({
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
    lng: locale,
    fallbackLng: "en",
    defaultNS: "common",
    fallbackNS: "common",
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
  });
  return instance;
}
