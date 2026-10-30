"use client";

import {
  countsByMonth,
  countsByShop,
  countsByWeekday,
  countsByYear,
  priceOf,
  spendSummary,
} from "@/lib/dashboard-metrics";
import { monthName, weekdayName } from "@/lib/date";
import { translateShopName } from "@/lib/default-shops";
import { formatMoney, formatMoneyShort } from "@/lib/drinks";
import type { Drink } from "@/lib/types";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../dashboard/dashboard-context";
import useDayValues, { type Measure } from "../../hooks/use-day-values";
import { useUser } from "../../providers/user-provider";
import InkBars, { type InkBar } from "../sheet/ink-bars";
import InkScroll from "../sheet/ink-scroll";
import { Segmented } from "../ui/fields";
import MeasureToggle from "./measure-toggle";
import { useRangeLabel } from "./range-picker";
import ShopAvatar from "./shop-avatar";

type TrendMode = "day" | "month" | "weekday" | "year" | "shop";

const MODES: readonly { value: TrendMode; key: string }[] = [
  { value: "day", key: "trendDay" },
  { value: "month", key: "trendMonth" },
  { value: "weekday", key: "trendWeekday" },
  { value: "year", key: "trendYear" },
  { value: "shop", key: "trendShop" },
];

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};

interface TrendsSectionProps {
  drinks: readonly Drink[];
  inRange: readonly Drink[];
}

export default function TrendsSection({ drinks, inRange }: TrendsSectionProps) {
  const { user } = useUser();
  const { today, sheetYear, setFocus, range } = useDashboard();
  const { t, i18n } = useTranslation("dashboard");
  const rangeLabel = useRangeLabel();
  const [mode, setMode] = useState<TrendMode>("day");
  const [measure, setMeasure] = useState<Measure>("drinks");
  const { canSpend, spent, counts, levelOf, tileLabel, currency } =
    useDayValues(drinks, measure, DATE_FORMAT);
  const spend = useMemo(() => spendSummary(inRange), [inRange]);

  const bars = useMemo<InkBar[]>(() => {
    const weigh = spent ? priceOf : undefined;
    const bar = (key: string, label: string, value: number) =>
      spent
        ? {
            key,
            label,
            value,
            display: formatMoneyShort(value, currency, i18n.language),
            description: `${label} · ${formatMoney(value, currency, i18n.language)}`,
          }
        : {
            key,
            label,
            value,
            description: `${label} · ${t("dayCount", { count: value })}`,
          };

    switch (mode) {
      case "month":
        return countsByMonth(inRange, weigh).map((value, month) =>
          bar(String(month), monthName(month, i18n.language), value),
        );
      case "weekday":
        return countsByWeekday(inRange, weigh).map((value, weekday) =>
          bar(String(weekday), weekdayName(weekday, i18n.language), value),
        );
      case "year":
        return countsByYear(inRange, range, weigh).map(([year, value]) =>
          bar(String(year), String(year), value),
        );
      case "shop": {
        const byShop = countsByShop(inRange, weigh);
        return [...(user?.shops ?? [])]
          .map((shop) => ({ shop, value: byShop.get(shop.id) ?? 0 }))
          .sort((a, b) => b.value - a.value)
          .map(({ shop, value }) => {
            const name = translateShopName(shop.name, i18n.language);
            return {
              ...bar(String(shop.id), name, value),
              label: (
                <span className="flex min-w-0 flex-col items-center gap-1">
                  <ShopAvatar src={shop.avatar} name={name} size={22} />
                  <span className="max-w-full truncate">{name}</span>
                </span>
              ),
            };
          });
      }
      default:
        return [];
    }
  }, [mode, spent, inRange, range, user?.shops, currency, i18n.language, t]);

  return (
    <section aria-labelledby="trends-heading">
      <div className="mb-5 space-y-3">
        <div className="flex items-baseline gap-3">
          <h2 id="trends-heading" className="font-kai text-xl text-text">
            {t("trends")}
          </h2>
          <span className="text-xs text-text-2 tabular-nums">
            {mode === "day"
              ? sheetYear
              : `${rangeLabel.start} – ${rangeLabel.end}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <MeasureToggle
            spent={spent}
            canSpend={canSpend}
            onChange={setMeasure}
          />
          <Segmented
            compact
            label={t("trends")}
            value={mode}
            options={MODES.map((option) => ({
              value: option.value,
              label: t(option.key),
            }))}
            onChange={setMode}
          />
        </div>
      </div>

      <div className="h-56">
        {mode === "day" ? (
          <InkScroll
            year={sheetYear}
            counts={counts}
            today={today}
            label={t("inkScrollLabel", { year: sheetYear })}
            todayLabel={t("today")}
            tileLabel={tileLabel}
            levelOf={levelOf}
            onSelectDay={(day) => setFocus({ day })}
          />
        ) : spent && spend.priced === 0 ? (
          <p className="grid h-full place-items-center border-b border-rule-strong px-6 text-center text-sm text-text-2">
            {t("spentEmpty")}
          </p>
        ) : (
          <InkBars
            bars={bars}
            label={t(MODES.find((m) => m.value === mode)?.key ?? MODES[0].key)}
          />
        )}
      </div>
    </section>
  );
}
