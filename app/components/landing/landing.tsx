"use client";

import { SAMPLE, SAMPLE_SHOPS } from "@/lib/sample-year";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import ShopAvatar from "../dashboard/shop-avatar";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";
import HangingScroll from "./hanging-scroll";
import InkMountains from "./ink-mountains";

const POINTS = [
  { title: "pointYearTitle", body: "pointYearBody" },
  { title: "pointTrendsTitle", body: "pointTrendsBody" },
  { title: "pointSummaryTitle", body: "pointSummaryBody" },
] as const;

export default function Landing({ signedIn = false }) {
  const { t } = useTranslation("landing");
  const { t: tc } = useTranslation("common");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        action={
          <Link
            href={signedIn ? "/dashboard" : "/auth"}
            className="btn btn-quiet ml-1 h-9 px-3 sm:ml-2 sm:px-3.5"
          >
            {t(signedIn ? "yourLog" : "signIn")}
          </Link>
        }
      />

      <main className="flex-1">
        <div className="relative isolate">
          <InkMountains className="absolute inset-x-0 bottom-0 -z-10 h-[clamp(14rem,58vw,22rem)] w-full sm:h-56 lg:h-72" />
          <section className="mx-auto grid max-w-7xl gap-y-12 px-4 pt-8 pb-[clamp(14rem,58vw,22rem)] sm:px-8 sm:pt-12 sm:pb-60 lg:px-12 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:items-start xl:gap-x-14 xl:gap-y-0 xl:pt-5 xl:pb-[300px]">
            <div className="xl:row-span-2 xl:self-center">
              <h1 className="font-kai text-5xl leading-[1.12] text-text sm:text-6xl xl:text-7xl">
                {t("headingLine1")}
                <br />
                <span className="text-accent-ink">{t("headingLine2")}</span>
              </h1>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-text-2">
                {t("subheading")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href={signedIn ? "/dashboard" : "/auth"}
                  className="btn btn-primary h-11 px-6 text-[15px]"
                >
                  {t(signedIn ? "openLog" : "getStarted")}
                </Link>
                <a
                  href="https://github.com/Tom-the-Bomb/boba-log"
                  target="_blank"
                  rel="noreferrer"
                  className="tap-target relative inline-flex items-center gap-1 text-sm text-text-2 hover:text-text hover:underline"
                >
                  {tc("sourceOnGitHub")}
                  <ArrowUpRight size={15} strokeWidth={1.5} />
                </a>
              </div>
            </div>

            <HangingScroll className="hidden w-full max-w-[624px] sm:block xl:col-start-2 xl:row-start-1 xl:justify-self-end" />

            <ul className="grid w-full max-w-[624px] grid-cols-3 gap-x-3 sm:-mt-2 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-3 sm:pl-1 xl:col-start-2 xl:row-start-2 xl:mt-10 xl:justify-self-end">
              {SAMPLE_SHOPS.map((shop, index) => (
                <li
                  key={shop.name}
                  className="flex min-w-0 items-center gap-2 sm:gap-2.5"
                >
                  <ShopAvatar src={shop.avatar} name={shop.name} size={28} />
                  {/* Name over count on phones, side by side from sm. */}
                  <span className="flex min-w-0 flex-col leading-tight sm:flex-row sm:items-center sm:gap-2.5">
                    <span className="truncate text-[13px] whitespace-nowrap text-text sm:text-sm">
                      {shop.name}
                    </span>
                    <span className="num font-kai text-base text-text sm:text-lg">
                      {SAMPLE.shopTotals[index]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8 lg:px-12">
          <ul className="grid gap-10 pt-4 md:grid-cols-3 md:gap-12">
            {POINTS.map((point) => (
              <li key={point.title}>
                <h2 className="font-kai text-2xl text-text">
                  {t(point.title)}
                </h2>
                <p className="mt-2.5 max-w-sm leading-relaxed text-text-2">
                  {t(point.body)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
