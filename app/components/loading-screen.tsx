"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import SealMark from "./brand/seal-mark";

export default function LoadingScreen() {
  const { t } = useTranslation("common");
  const pathname = usePathname();

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
          <a href={pathname} className="link">
            {t("reload")}
          </a>
        </p>
      </div>
    </main>
  );
}
