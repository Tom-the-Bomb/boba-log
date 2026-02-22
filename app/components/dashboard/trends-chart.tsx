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
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import LazyBar from "./lazy-bar";

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
        <h2 className="font-display text-xl font-medium tracking-tight text-tea-charcoal">
          {t("trends")}
        </h2>
        <div className="flex gap-4 border-b border-tea-stone">
          {GRANULARITY_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setGranularity(value)}
              className={`tea-mini-tab pb-2 ${
                granularity === value
                  ? "border-b-2 border-tea-charcoal text-tea-charcoal"
                  : "text-tea-faint hover:text-tea-charcoal"
              }`}
            >
              {t(GRANULARITY_KEYS[value])}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 w-full">
        <LazyBar data={data} options={options} />
      </div>
    </section>
  );
}
