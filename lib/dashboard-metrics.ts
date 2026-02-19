import { useTranslation } from "react-i18next";
import { translateShopName } from "./default-shops";
import type { BobaShop } from "./types";

export type Granularity = "year" | "month" | "weekday";

export const GRANULARITY_OPTIONS: readonly Granularity[] = [
  "year",
  "month",
  "weekday",
];

export const GRANULARITY_KEYS: Record<Granularity, string> = {
  year: "granularityYear",
  month: "granularityMonth",
  weekday: "granularityWeekday",
};

interface ShopCountItem {
  shop: BobaShop;
  count: number;
}

interface DateBounds {
  start: Date;
  end: Date;
}

function getDateBounds(startDate: string, endDate: string): DateBounds | null {
  if (!startDate || !endDate) {
    return null;
  }

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
  if (!bounds) {
    return shop.total;
  }

  return Object.entries(shop.dates).reduce((sum, [epochStr, count]) => {
    const point = new Date(Number(epochStr) * 1000);
    return point >= bounds.start && point <= bounds.end ? sum + count : sum;
  }, 0);
}

export function buildShopCounts(
  shops: readonly BobaShop[],
  startDate: string,
  endDate: string,
): ShopCountItem[] {
  return shops.map((shop) => ({
    shop,
    count: getShopCountForRange(shop, startDate, endDate),
  }));
}

export function buildByShopChartData(
  { t, i18n }: ReturnType<typeof useTranslation>,
  shopCounts: ShopCountItem[],
) {
  return {
    labels: shopCounts.map(({ shop }) =>
      translateShopName(shop.name, i18n.language),
    ),
    datasets: [
      {
        label: t("drinks"),
        data: shopCounts.map(({ count }) => count),
        backgroundColor: "rgba(123, 139, 111, 0.6)",
        borderRadius: 4,
      },
    ],
  };
}

export function buildTrendsChartData(
  t: ReturnType<typeof useTranslation>["t"],
  shops: readonly BobaShop[],
  startDate: string,
  endDate: string,
  granularity: Granularity,
) {
  const bucketMap: Record<string, number> = {};
  const bounds = getDateBounds(startDate, endDate);

  for (const shop of shops) {
    for (const [epochStr, count] of Object.entries(shop.dates)) {
      const point = new Date(Number(epochStr) * 1000);

      if (bounds && (point < bounds.start || point > bounds.end)) {
        continue;
      }

      let key = "";
      if (granularity === "year") {
        key = String(point.getUTCFullYear());
      } else if (granularity === "month") {
        key = t(`monthLabels[${point.getUTCMonth()}]`);
      } else {
        key = t(`weekdayNames[${point.getUTCDay()}]`);
      }

      bucketMap[key] = (bucketMap[key] ?? 0) + count;
    }
  }

  let labels: readonly string[];
  if (granularity === "month") {
    labels = Array.from({ length: 12 }, (_, i) => t(`monthLabels[${i}]`));
  } else if (granularity === "weekday") {
    labels = Array.from({ length: 7 }, (_, i) => t(`weekdayNames[${i}]`));
  } else {
    const currentYear = String(new Date().getUTCFullYear());
    const yearLabels = new Set(Object.keys(bucketMap));
    yearLabels.add(currentYear);
    labels = Array.from(yearLabels).sort((a, b) => Number(a) - Number(b));
  }

  return {
    labels: labels as string[],
    datasets: [
      {
        label: t("bobaPerGranularity", {
          granularity: t(GRANULARITY_KEYS[granularity]),
        }),
        data: labels.map((label) => bucketMap[label] ?? 0),
        backgroundColor: "rgba(196, 169, 106, 0.6)",
        borderRadius: 4,
      },
    ],
  };
}
