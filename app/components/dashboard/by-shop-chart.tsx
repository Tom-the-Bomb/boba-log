"use client";

import { buildDashboardChartOptions } from "@/lib/dashboard-chart-options";
import { buildByShopChartData, buildShopCounts } from "@/lib/dashboard-metrics";
import type { BobaShop } from "@/lib/types";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../providers/theme-provider";

const Bar = dynamic(
  async () => {
    const [
      { Bar },
      { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend },
    ] = await Promise.all([import("react-chartjs-2"), import("chart.js")]);
    Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
    return { default: Bar };
  },
  { ssr: false },
);

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
  const { isDark } = useTheme();
  const translator = useTranslation("dashboard");

  const shopCounts = useMemo(
    () => buildShopCounts(shops, startDate, endDate),
    [shops, startDate, endDate],
  );

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
