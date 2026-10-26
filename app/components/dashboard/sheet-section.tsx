"use client";

import {
  countsByDay,
  priceOf,
  spendLevel,
  spendSteps,
  typicalPrice,
} from "@/lib/dashboard-metrics";
import { dayParts, formatDay } from "@/lib/date";
import { formatMoney, formatMoneyShort } from "@/lib/drinks";
import type { Drink } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../dashboard/dashboard-context";
import { useUser } from "../../providers/user-provider";
import DropLegend from "../sheet/drop-legend";
import YearSheet from "../sheet/year-sheet";
import { Segmented } from "../ui/fields";

export default function SheetSection({ drinks }: { drinks: readonly Drink[] }) {
  const { today, earliest, range, focus, setFocus, sheetYear, setSheetYear } =
    useDashboard();
  const { t, i18n } = useTranslation("dashboard");
  const { user } = useUser();
  const currency = user?.currency ?? "USD";
  const [measure, setMeasure] = useState<"drinks" | "spent">("drinks");
  const typical = useMemo(() => typicalPrice(drinks), [drinks]);
  const spent = measure === "spent" && typical !== null;
  const counts = useMemo(
    () => countsByDay(drinks, spent ? priceOf : undefined),
    [drinks, spent],
  );
  const steps = typical === null ? [] : spendSteps(typical);
  const money = (cents: number) =>
    formatMoneyShort(cents, currency, i18n.language);
  const minYear = dayParts(earliest).year;
  const maxYear = dayParts(today).year;

  const tileLabel = useCallback(
    (day: string, value: number) => {
      const date = formatDay(day, i18n.language, {
        weekday: "short",
        month: "long",
        day: "numeric",
      });
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
    [spent, currency, i18n.language, t],
  );

  const selectDay = (day: string) =>
    setFocus(focus?.day === day ? null : { day });

  return (
    <section aria-labelledby="sheet-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <h2
            id="sheet-heading"
            className="num mr-2 font-kai text-xl text-text"
          >
            {sheetYear}
          </h2>
          <button
            type="button"
            disabled={sheetYear <= minYear}
            onClick={() => setSheetYear(sheetYear - 1)}
            className="tap-target relative grid size-10 place-items-center rounded-md text-text-2 hover:bg-hover hover:text-text disabled:opacity-30 sm:size-9"
            aria-label={t("previousYear")}
          >
            <ChevronLeft size={17} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            disabled={sheetYear >= maxYear}
            onClick={() => setSheetYear(sheetYear + 1)}
            className="tap-target relative grid size-10 place-items-center rounded-md text-text-2 hover:bg-hover hover:text-text disabled:opacity-30 sm:size-9"
            aria-label={t("nextYear")}
          >
            <ChevronRight size={17} strokeWidth={1.5} />
          </button>
        </div>
        <Segmented
          compact
          label={t("trendMeasure")}
          value={spent ? "spent" : "drinks"}
          options={[
            { value: "drinks", label: t("trendDrinks") },
            {
              value: "spent",
              label: t("trendSpent"),
              disabled: typical === null,
            },
          ]}
          onChange={setMeasure}
        />
      </div>

      <YearSheet
        year={sheetYear}
        counts={counts}
        today={today}
        range={range}
        selectedDay={focus?.day ?? null}
        onSelectDay={selectDay}
        label={String(sheetYear)}
        tileLabel={tileLabel}
        levelOf={spent ? (cents) => spendLevel(cents, steps) : undefined}
        formatTotal={
          spent ? (cents) => (cents > 0 ? money(cents) : "") : undefined
        }
      />

      {/* Room for two lines either way, so switching never moves what follows. */}
      <div className="mt-5 flex min-h-12 items-start sm:justify-end">
        {spent ? (
          <DropLegend
            caption={t("spentADay")}
            labels={[
              `≤ ${money(steps[0])}`,
              `≤ ${money(steps[1])}`,
              `≤ ${money(steps[2])}`,
              `> ${money(steps[2])}`,
            ]}
          />
        ) : (
          <DropLegend />
        )}
      </div>
    </section>
  );
}
