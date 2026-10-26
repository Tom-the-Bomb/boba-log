"use client";

import { createI18n } from "@/i18n";
import {
  LEGACY_LOCALE_STORAGE_KEY,
  LOCALE_COOKIE,
  toLocale,
  type Locale,
} from "@/i18n/locale";
import { intlLocale } from "@/lib/date";
import { useEffect, useState, type ReactNode } from "react";
import { I18nProvider } from "react-aria-components";
import { I18nextProvider, useTranslation } from "react-i18next";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Keeps React Aria's calendars and formatting in the app's language. */
function AriaLocale({ children }: { children: ReactNode }) {
  const { i18n: instance } = useTranslation();
  return (
    <I18nProvider locale={intlLocale(instance.language)}>
      {children}
    </I18nProvider>
  );
}

/**
 * The app's language, starting from the one the server rendered (read from a
 * cookie). Changing it rewrites the cookie and the page's lang attribute.
 */
export default function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [i18n] = useState(() => createI18n(locale));

  useEffect(() => {
    const remember = (language: string) => {
      document.cookie = `${LOCALE_COOKIE}=${language}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      document.documentElement.lang = language;
    };
    i18n.on("languageChanged", remember);

    // Visitors from before the cookie: carry their saved language over once.
    try {
      const saved = localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY);
      if (saved && toLocale(saved) !== locale) {
        void i18n.changeLanguage(toLocale(saved));
      }
      localStorage.removeItem(LEGACY_LOCALE_STORAGE_KEY);
    } catch {}

    return () => i18n.off("languageChanged", remember);
  }, [i18n, locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <AriaLocale>{children}</AriaLocale>
    </I18nextProvider>
  );
}
