"use client";

import { buildDashboardChartOptions } from "@/lib/dashboard-chart-options";
import {
  buildTrendsChartData,
  GRANULARITY_KEYS,
  GRANULARITY_OPTIONS,
  type Granularity,
} from "@/lib/dashboard-metrics";
import type { BobaShop } from "@/lib/types";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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

interface TrendsChartProps {
  shops: readonly BobaShop[];
  startDate: string;
  endDate: string;
}

export default function TrendsChart({
  shops,
  startDate,
  endDate,
}: TrendsChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { t } = useTranslation("dashboard");
  const [granularity, setGranularity] = useState<Granularity>("year");

  const data = useMemo(
    () => buildTrendsChartData(t, shops, startDate, endDate, granularity),
    [shops, startDate, endDate, granularity, t],
  );

  const options = useMemo(() => buildDashboardChartOptions(isDark), [isDark]);

  return (
    <section className="mb-20">
      <div className="mb-8 flex flex-wrap items-center gap-8">
        <h2 className="tea-text-primary font-display text-xl font-medium tracking-tight">
          {t("trends")}
        </h2>
        <div className="tea-border-subtle flex gap-4 border-b">
          {GRANULARITY_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setGranularity(value)}
              className={`tea-mini-tab pb-2 ${
                granularity === value
                  ? "tea-border-strong tea-text-primary border-b-2"
                  : "tea-text-muted tea-hover-text-primary"
              }`}
            >
              {t(GRANULARITY_KEYS[value])}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 w-full">
        <Bar data={data} options={options} />
      </div>
    </section>
  );
}
