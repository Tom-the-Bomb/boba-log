"use client";

import type { Granularity } from "@/lib/dashboard-metrics";
import { GRANULARITY_OPTIONS } from "@/lib/dashboard-metrics";
import type { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

interface TrendsChartProps {
  hasShops: boolean;
  data: ChartData<"bar">;
  options: ChartOptions<"bar">;
  granularity: Granularity;
  onGranularityChange: (value: Granularity) => void;
}

export default function TrendsChart({
  hasShops,
  data,
  options,
  granularity,
  onGranularityChange,
}: TrendsChartProps) {
  return (
    <section className="mb-20">
      <div className="mb-8 flex flex-wrap items-center gap-8">
        <h2 className="font-display tea-text-primary text-xl font-medium tracking-tight">
          Trends
        </h2>
        <div className="tea-border-subtle flex gap-4 border-b">
          {GRANULARITY_OPTIONS.map((value) => (
            <button
              key={value}
              onClick={() => onGranularityChange(value)}
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
      {hasShops ? (
        <div className="h-72 w-full">
          <Bar data={data} options={options} />
        </div>
      ) : (
        <p className="tea-text-secondary text-sm">No data yet.</p>
      )}
    </section>
  );
}
