"use client";

import { buildDashboardChartOptions } from "@/lib/dashboard-chart-options";
import { buildByShopChartData, buildShopCounts } from "@/lib/dashboard-metrics";
import type { BobaShop } from "@/lib/types";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import LazyBar from "./lazy-bar";

interface ByShopChartProps {
  shops: readonly BobaShop[];
  startDate: string;
  endDate: string;
}

export default function ByShopChart({
  shops,
  startDate,
  endDate,
}: ByShopChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { t, i18n } = useTranslation("dashboard");
  const locale = i18n.language;

  const shopCounts = useMemo(
    () => buildShopCounts(shops, startDate, endDate),
    [shops, startDate, endDate],
  );

  const data = useMemo(
    () => buildByShopChartData(t, locale, shopCounts),
    [shopCounts, t, locale],
  );

  const options = useMemo(() => buildDashboardChartOptions(isDark), [isDark]);

  return (
    <section className="mb-20">
      <h2 className="mb-8 font-display text-xl font-medium tracking-tight text-tea-charcoal">
        {t("byShop")}
      </h2>
      <div className="h-72 w-full">
        <LazyBar data={data} options={options} />
      </div>
    </section>
  );
}
