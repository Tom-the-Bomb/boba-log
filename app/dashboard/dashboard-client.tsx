"use client";

import { drinksInRange } from "@/lib/dashboard-metrics";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DayPanel from "../components/dashboard/day-panel";
import RecentDrinks from "../components/dashboard/recent-drinks";
import SheetSection from "../components/dashboard/sheet-section";
import ShopList from "../components/dashboard/shop-list";
import SummarySentence from "../components/dashboard/summary-sentence";
import TrendsSection from "../components/dashboard/trends-section";
import { useUser } from "../providers/user-provider";
import { useDashboard } from "./dashboard-context";

export default function DashboardClient() {
  const { user } = useUser();
  const { range } = useDashboard();
  const { t } = useTranslation("dashboard");
  const drinks = useMemo(() => user?.drinks ?? [], [user?.drinks]);
  const inRange = useMemo(() => drinksInRange(drinks, range), [drinks, range]);

  if (!user) {
    return null;
  }

  return (
    <main
      id="main-content"
      className="mx-auto grid max-w-7xl grid-cols-1 gap-x-10 gap-y-12 px-4 pt-8 pb-20 [grid-template-areas:'shops'_'recent'_'main'] sm:px-8 sm:pt-10 md:grid-cols-2 md:[grid-template-areas:'shops_recent'_'main_main'] lg:grid-cols-[22rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:px-12 lg:[grid-template-areas:'shops_main'_'recent_main'] xl:gap-x-20"
    >
      <h1 className="sr-only">{t("tabLog")}</h1>
      <div className="[grid-area:shops]">
        <ShopList inRange={inRange} />
      </div>
      <div className="self-start [grid-area:recent]">
        <RecentDrinks />
      </div>
      <div className="space-y-10 [grid-area:main]">
        <SummarySentence drinks={inRange} currency={user.currency} />
        <SheetSection drinks={drinks} />
        {drinks.length > 0 && (
          <TrendsSection drinks={drinks} inRange={inRange} />
        )}
        <DayPanel />
      </div>
    </main>
  );
}
