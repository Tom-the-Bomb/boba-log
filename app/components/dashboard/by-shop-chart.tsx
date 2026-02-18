"use client";

import type { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

interface ByShopChartProps {
  data: ChartData<"bar">;
  options: ChartOptions<"bar">;
}

export default function ByShopChart({ data, options }: ByShopChartProps) {
  const { t } = useTranslation("dashboard");

  return (
    <section className="mb-20">
      <h2 className="tea-text-primary mb-8 font-display text-xl font-medium tracking-tight">
        {t("byShop")}
      </h2>
      <div className="h-72 w-full">
        <Bar data={data} options={options} />
      </div>
    </section>
  );
}
