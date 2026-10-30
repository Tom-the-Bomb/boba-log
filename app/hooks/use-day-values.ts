"use client";

import {
  countsByDay,
  priceOf,
  spendLevel,
  spendSteps,
  typicalPrice,
} from "@/lib/dashboard-metrics";
import { formatDay } from "@/lib/date";
import { formatMoney } from "@/lib/drinks";
import type { Drink } from "@/lib/types";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../providers/user-provider";

export type Measure = "drinks" | "spent";

export default function useDayValues(
  drinks: readonly Drink[],
  measure: Measure,
  dateFormat: Intl.DateTimeFormatOptions,
) {
  const { t, i18n } = useTranslation("dashboard");
  const { user } = useUser();
  const currency = user?.currency ?? "USD";
  const typical = useMemo(() => typicalPrice(drinks), [drinks]);
  const spent = measure === "spent" && typical !== null;
  const counts = useMemo(
    () => countsByDay(drinks, spent ? priceOf : undefined),
    [drinks, spent],
  );
  const steps = useMemo(
    () => (typical === null ? [] : spendSteps(typical)),
    [typical],
  );
  const levelOf = useMemo(
    () => (spent ? (cents: number) => spendLevel(cents, steps) : undefined),
    [spent, steps],
  );

  const tileLabel = useCallback(
    (day: string, value: number) => {
      const date = formatDay(day, i18n.language, dateFormat);
      if (spent) {
        return value > 0
          ? t("tileSpent", {
              date,
              amount: formatMoney(value, currency, i18n.language),
            })
          : t("tileSpentNone", { date });
      }
      return value > 0
        ? t("tileLabel", { date, count: value })
        : t("tileLabelNone", { date });
    },
    [spent, currency, dateFormat, i18n.language, t],
  );

  return {
    canSpend: typical !== null,
    spent,
    counts,
    steps,
    levelOf,
    tileLabel,
    currency,
  };
}
