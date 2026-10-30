"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import SiteHeader from "./components/site-header";

export default function NotFound() {
  const { t } = useTranslation("not-found");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="grid flex-1 place-items-center px-4 pb-24">
        <section className="flex max-w-sm flex-col items-center text-center">
          <svg aria-hidden="true" viewBox="0 0 64 64" className="size-16">
            <circle
              cx="32"
              cy="32"
              r="23"
              fill="none"
              stroke="var(--rim-1)"
              strokeWidth="2.2"
              opacity="0.6"
            />
            <circle
              cx="33.2"
              cy="31.2"
              r="22.4"
              fill="none"
              stroke="var(--glaze-1)"
              strokeWidth="1.2"
              opacity="0.7"
            />
          </svg>
          <h1 className="mt-8 font-kai text-3xl text-text">{t("title")}</h1>
          <p className="mt-3 text-base leading-relaxed text-text-2">
            {t("description")}
          </p>
          <Link href="/" className="btn btn-quiet mt-8">
            {t("backToHome")}
          </Link>
        </section>
      </main>
    </div>
  );
}
