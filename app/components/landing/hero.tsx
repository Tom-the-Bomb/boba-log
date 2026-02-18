"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import TeaCupMark from "../icons/tea-cup-mark";

export default function Hero() {
  const router = useRouter();
  const { t } = useTranslation("landing");

  return (
    <main className="tea-page-padding relative flex flex-1 flex-col items-start justify-center py-12 sm:py-20">
      <div className="w-full max-w-3xl">
        <h3 className="reveal reveal-d1 tea-text-accent text-xs tracking-[0.35em] uppercase">
          {t("tagline")}
        </h3>

        <h1 className="reveal reveal-d2 tea-text-primary mt-6 font-display text-5xl leading-[1.08] font-semibold sm:mt-8 sm:text-6xl lg:text-7xl">
          {t("headingLine1")}
          <br />
          <span className="tea-text-accent">{t("headingLine2")}</span>
        </h1>

        <h2 className="reveal reveal-d3 tea-text-secondary mt-6 max-w-lg text-base leading-relaxed sm:mt-8 sm:text-lg">
          {t("subheading")}
        </h2>

        <div className="reveal reveal-d4 mt-8 flex items-center gap-5 sm:mt-12 sm:gap-8">
          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="tea-cta inline-block rounded-none px-5 py-3 text-xs tracking-[0.2em] uppercase sm:px-8 sm:py-3.5"
          >
            {t("getStarted")}
          </button>
          <button
            type="button"
            onClick={() =>
              window.open("https://github.com/Tom-the-Bomb/boba-log", "_blank")
            }
            className="group tea-text-muted tea-hover-text-primary flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-colors duration-300"
          >
            {t("learnMore")}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </button>
        </div>
      </div>

      <div className="reveal reveal-d5 pointer-events-none absolute right-6 bottom-1 sm:right-10 sm:bottom-4 lg:right-12 xl:right-24">
        <div className="origin-bottom-right scale-[0.7] sm:scale-100 lg:scale-120">
          <TeaCupMark />
        </div>
      </div>
    </main>
  );
}
