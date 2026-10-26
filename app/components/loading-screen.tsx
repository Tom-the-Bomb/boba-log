"use client";

import { useTranslation } from "react-i18next";
import SealMark from "./brand/seal-mark";

/**
 * The seal and "Loading…" while the log loads. If loading stalls, as when a
 * script fails to arrive, a plain Reload link appears after a while; it is
 * revealed by CSS and is an ordinary link, so it works even if scripts never
 * run.
 */
export default function LoadingScreen() {
  const { t } = useTranslation("common");

  return (
    <main
      className="grid min-h-dvh place-items-center px-4 text-center"
      aria-busy="true"
    >
      <div>
        <h1 className="flex items-center justify-center gap-3 text-sm text-text-2">
          <SealMark size={22} text="茶" />
          {t("loading")}
        </h1>
        <p role="status" className="reveal-late mt-4 text-sm text-text-2">
          {t("slowLoad")}{" "}
          <a href="" className="link">
            {t("reload")}
          </a>
        </p>
      </div>
    </main>
  );
}
