"use client";

import { buildDashboardChartOptions } from "@/lib/dashboard-chart-options";
import {
  buildByShopChartData,
  type ShopCountItem,
} from "@/lib/dashboard-metrics";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../providers/theme-provider";

interface ByShopChartProps {
  shopCounts: ShopCountItem[];
}

export default function ByShopChart({ shopCounts }: ByShopChartProps) {
  const { isDark } = useTheme();
  const translator = useTranslation("dashboard");

  const data = useMemo(
    () => buildByShopChartData(translator, shopCounts),
    [shopCounts, translator],
  );

  const options = useMemo(() => buildDashboardChartOptions(isDark), [isDark]);

  return (
    <section className="mb-20">
      <h2 className="tea-text-primary mb-8 font-display text-xl font-medium tracking-tight">
        {translator.t("byShop")}
      </h2>
      <div className="h-72 w-full">
        <Bar data={data} options={options} />
      </div>
    </section>
  );
}
