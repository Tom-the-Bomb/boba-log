import type { BobaShop } from "./types";

export type Granularity = "year" | "month" | "weekday";

export const GRANULARITY_OPTIONS: readonly Granularity[] = [
  "year",
  "month",
  "weekday",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export interface ShopCountItem {
  shop: BobaShop;
  count: number;
}

interface DateBounds {
  start: Date;
  end: Date;
}

function getDateBounds(startDate: string, endDate: string): DateBounds | null {
  if (!startDate || !endDate) return null;

  return {
    start: new Date(`${startDate}T00:00:00.000Z`),
    end: new Date(`${endDate}T23:59:59.999Z`),
  };
}

export function getShopCountForRange(
  shop: BobaShop,
  startDate: string,
  endDate: string,
): number {
  const bounds = getDateBounds(startDate, endDate);
  if (!bounds) return shop.total;

  return Object.entries(shop.dates).reduce((sum, [isoDate, count]) => {
    const point = new Date(isoDate);
    return point >= bounds.start && point <= bounds.end ? sum + count : sum;
  }, 0);
}

export function buildShopCounts(
  shops: BobaShop[],
  startDate: string,
  endDate: string,
): ShopCountItem[] {
  return shops.map((shop) => ({
    shop,
    count: getShopCountForRange(shop, startDate, endDate),
  }));
}

export function getTotalCount(shopCounts: ShopCountItem[]): number {
  return shopCounts.reduce((sum, item) => sum + item.count, 0);
}

export function buildByShopChartData(shopCounts: ShopCountItem[]) {
  return {
    labels: shopCounts.map(({ shop }) => shop.name),
    datasets: [
      {
        label: "Drinks",
        data: shopCounts.map(({ count }) => count),
        backgroundColor: "rgba(123, 139, 111, 0.6)",
        borderRadius: 4,
      },
    ],
  };
}

export function buildTrendsChartData(
  shops: BobaShop[],
  startDate: string,
  endDate: string,
  granularity: Granularity,
) {
  const bucketMap: Record<string, number> = {};
  const bounds = getDateBounds(startDate, endDate);

  for (const shop of shops) {
    for (const [isoDate, count] of Object.entries(shop.dates)) {
      const point = new Date(isoDate);

      if (bounds && (point < bounds.start || point > bounds.end)) {
        continue;
      }

      let key = "";
      if (granularity === "year") {
        key = String(point.getUTCFullYear());
      } else if (granularity === "month") {
        key = MONTH_LABELS[point.getUTCMonth()];
      } else {
        key = WEEKDAY_LABELS[point.getUTCDay()];
      }

      bucketMap[key] = (bucketMap[key] ?? 0) + count;
    }
  }

  let labels: string[];
  if (granularity === "month") {
    labels = MONTH_LABELS;
  } else if (granularity === "weekday") {
    labels = WEEKDAY_LABELS;
  } else {
    const currentYear = String(new Date().getUTCFullYear());
    const yearLabels = new Set(Object.keys(bucketMap));
    yearLabels.add(currentYear);
    labels = Array.from(yearLabels).sort((a, b) => Number(a) - Number(b));
  }

  return {
    labels,
    datasets: [
      {
        label: `Boba per ${granularity}`,
        data: labels.map((label) => bucketMap[label] ?? 0),
        backgroundColor: "rgba(196, 169, 106, 0.6)",
        borderRadius: 4,
      },
    ],
  };
}
