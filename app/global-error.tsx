"use client";

import { LOCALE_COOKIE, toLocale, type Locale } from "@/i18n/locale";
import commonMessages from "@/i18n/messages/common.json";
import "@fontsource/lxgw-wenkai-tc/400.css";
import "@fontsource/noto-sans-sc/300.css";
import "@fontsource/noto-sans-sc/400.css";
import { useSyncExternalStore } from "react";
import ErrorScreen from "./components/error-screen";
import "./fonts/marks.css";
import "./globals.css";

function subscribe() {
  return () => {};
}

function readLocale(): Locale {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  return toLocale(match?.[1]);
}

function readDark() {
  try {
    return localStorage.getItem("boba_theme") === "dark";
  } catch {
    return false;
  }
}

// The root layout itself failed, so this page brings its own document, fonts,
// language and theme, without the providers that failed with it.
export default function GlobalError() {
  const locale = useSyncExternalStore<Locale>(
    subscribe,
    readLocale,
    () => "en",
  );
  const dark = useSyncExternalStore(subscribe, readDark, () => false);
  const text = commonMessages[locale];

  return (
    <html lang={locale} className={dark ? "dark" : undefined}>
      <body>
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <filter id="seal-carve">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="2"
              seed="3"
            />
            <feDisplacementMap in="SourceGraphic" scale="1.6" />
          </filter>
        </svg>
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
