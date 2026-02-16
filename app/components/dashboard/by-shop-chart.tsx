"use client";

import type { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

interface ByShopChartProps {
  hasShops: boolean;
  data: ChartData<"bar">;
  options: ChartOptions<"bar">;
}

export default function ByShopChart({
  hasShops,
  data,
  options,
}: ByShopChartProps) {
  return (
    <section className="mb-20">
      <h2 className="font-display tea-text-primary mb-8 text-xl font-medium tracking-tight">
        By shop
      </h2>
      {hasShops ? (
        <div className="h-72 w-full">
          <Bar data={data} options={options} />
        </div>
      ) : (
        <p className="tea-text-secondary text-sm">
          Add your first shop to start charting.
        </p>
      )}
    </section>
  );
}
