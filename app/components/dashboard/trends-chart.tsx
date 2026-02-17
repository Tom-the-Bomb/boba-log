"use client";

import {
  buildTrendsChartData,
  GRANULARITY_OPTIONS,
  type Granularity,
} from "@/lib/dashboard-metrics";
import type { BobaShop } from "@/lib/types";
import type { ChartOptions } from "chart.js";
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";

interface TrendsChartProps {
  shops: readonly BobaShop[];
  startDate: string;
  endDate: string;
  options: ChartOptions<"bar">;
}

export default function TrendsChart({
  shops,
  startDate,
  endDate,
  options,
}: TrendsChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("year");

  const data = useMemo(
    () => buildTrendsChartData(shops, startDate, endDate, granularity),
    [shops, startDate, endDate, granularity],
  );

  return (
    <section className="mb-20">
      <div className="mb-8 flex flex-wrap items-center gap-8">
        <h2 className="tea-text-primary font-display text-xl font-medium tracking-tight">
          Trends
        </h2>
        <div className="tea-border-subtle flex gap-4 border-b">
          {GRANULARITY_OPTIONS.map((value) => (
            <button
              key={value}
              onClick={() => setGranularity(value)}
              className={`tea-mini-tab pb-2 ${
                granularity === value
                  ? "tea-border-strong tea-text-primary border-b-2"
                  : "tea-text-muted tea-hover-text-primary"
              }`}
            >
              {value}
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
