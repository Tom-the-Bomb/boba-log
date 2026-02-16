import type { ChartOptions } from "chart.js";

export const DEFAULT_Y_AXIS_TICK_COUNT = 5;

export function buildDashboardChartOptions(
  isDark: boolean,
  yAxisTickCount = DEFAULT_Y_AXIS_TICK_COUNT,
): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0,
    },
    plugins: {
      legend: {
        labels: {
          color: isDark ? "#F1F3F5" : "#1A1A1A",
          font: { family: "Sora, sans-serif", size: 11 },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          display: true,
          color: isDark ? "#93A0AD" : "#B5AFA5",
          font: { family: "Sora, sans-serif", size: 10 },
        },
        grid: { display: false },
        border: {
          display: true,
          color: isDark
            ? "rgba(147, 160, 173, 0.55)"
            : "rgba(212, 207, 199, 0.8)",
          width: 1,
        },
      },
      y: {
        beginAtZero: true,
        afterDataLimits: (scale) => {
          scale.min = 0;
          const dynamicStep = Math.max(
            1,
            Math.ceil(scale.max / (yAxisTickCount - 1)),
          );
          scale.max = dynamicStep * (yAxisTickCount - 1);
        },
        ticks: {
          display: true,
          color: isDark ? "#93A0AD" : "#B5AFA5",
          font: { family: "Sora, sans-serif", size: 10 },
          count: yAxisTickCount,
          precision: 0,
        },
        grid: { display: false },
        border: {
          display: true,
          color: isDark
            ? "rgba(147, 160, 173, 0.55)"
            : "rgba(212, 207, 199, 0.8)",
          width: 1,
        },
      },
    },
  };
}
