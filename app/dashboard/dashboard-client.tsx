"use client";

import { getShopCountForRange } from "@/lib/dashboard-metrics";
import { toDateStringUTC } from "@/lib/date";
import type { BobaShop } from "@/lib/types";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ByShopChart from "../components/dashboard/by-shop-chart";
import DateRangeSlider from "../components/dashboard/date-range-slider";
import Footer from "../components/dashboard/footer";
import Nav from "../components/dashboard/nav";
import ShopsSection from "../components/dashboard/shops-section";
import TrendsChart from "../components/dashboard/trends-chart";
import { useUser } from "../providers/user-provider";

const EMPTY_SHOPS: readonly BobaShop[] = [];

export default function DashboardClient() {
  const { user, isLoadingUser } = useUser();
  const { t } = useTranslation("dashboard");
  const shops = user?.shops ?? EMPTY_SHOPS;

  const defaultStartDate = user
    ? toDateStringUTC(new Date(user.createdAt * 1000))
    : "";
  const defaultEndDate = user ? toDateStringUTC(new Date()) : "";

  const [startDateOverride, setStartDate] = useState("");
  const [endDateOverride, setEndDate] = useState("");

  const startDate = startDateOverride || defaultStartDate;
  const endDate = endDateOverride || defaultEndDate;

  const totalCount = useMemo(
    () =>
      shops.reduce(
        (sum, shop) => sum + getShopCountForRange(shop, startDate, endDate),
        0,
      ),
    [shops, startDate, endDate],
  );

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tea-white">
        <p className="tea-text-muted text-sm tracking-[0.2em] uppercase">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="tea-grid-bg min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-5xl px-10 py-16 sm:px-16 lg:px-24">
        <section className="mb-20">
          <DateRangeSlider
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            minDate={user ? defaultStartDate : startDate}
            maxDate={toDateStringUTC(new Date())}
          />
        </section>

        <section className="mb-20 text-center">
          <p className="tea-text-accent text-xs tracking-[0.3em] uppercase">
            {t("totalDrinks")}
          </p>
          <p className="tea-text-primary mt-3 font-display text-8xl font-medium tracking-tight sm:text-9xl">
            {totalCount}
          </p>
        </section>

        <div className="tea-line mb-20" />

        <ShopsSection shops={shops} startDate={startDate} endDate={endDate} />

        <div className="tea-line mb-20" />

        <ByShopChart shops={shops} startDate={startDate} endDate={endDate} />

        <TrendsChart shops={shops} startDate={startDate} endDate={endDate} />
      </main>

      <Footer />
    </div>
  );
}
