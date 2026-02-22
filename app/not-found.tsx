"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import AuthFooter from "./components/auth/footer";

export default function NotFound() {
  const { t } = useTranslation("not-found");

  return (
    <div className="tea-grid-bg flex min-h-screen flex-col">
      <div className="tea-line tea-page-padding-sm" />

      <main className="tea-page-padding-sm flex flex-1 items-center justify-center py-16">
        <section className="reveal text-center">
          <p className="text-xs tracking-[0.35em] text-tea-sage uppercase">
            {t("title")}
          </p>
          <h1 className="reveal-d1 mt-4 font-display text-8xl font-medium tracking-tight text-tea-charcoal sm:text-9xl">
            404
          </h1>
          <p className="reveal-d2 mt-4 text-base leading-relaxed text-tea-ink">
            {t("description")}
          </p>
          <Link
            href="/"
            className="tea-cta reveal-d3 mt-10 inline-block px-8 py-3.5 text-xs tracking-[0.2em] uppercase"
          >
            {t("backToHome")}
          </Link>
        </section>
      </main>

      <AuthFooter />
    </div>
  );
}
