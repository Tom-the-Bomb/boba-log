"use client";

import { LOCALE_COOKIE, toLocale, type Locale } from "@/i18n/locale";
import commonMessages from "@/i18n/messages/common.json";
import "@fontsource/lxgw-wenkai-tc/400.css";
import "@fontsource/noto-sans-sc/300.css";
import "@fontsource/noto-sans-sc/400.css";
import { SealCarveFilter } from "./components/brand/seal-mark";
import ErrorScreen from "./components/error-screen";
import "./fonts/marks.css";
import "./globals.css";
import useMounted from "./hooks/use-mounted";
import { THEME_STORAGE_KEY } from "./providers/theme-provider";

function readLocale(): Locale {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  return toLocale(match?.[1]);
}

function readDark() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark";
  } catch {
    return false;
  }
}

export default function GlobalError() {
  const mounted = useMounted();
  const locale = mounted ? readLocale() : "en";
  const dark = mounted && readDark();
  const text = commonMessages[locale];

  return (
    <html lang={locale} className={dark ? "dark" : undefined}>
      <body className="paper">
        <SealCarveFilter />
        <ErrorScreen
          title={text.errorTitle}
          body={text.errorBody}
          action={text.reload}
          onAction={() => window.location.reload()}
        />
      </body>
    </html>
  );
}
