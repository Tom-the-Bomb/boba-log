"use client";

import { dayParts } from "@/lib/date";
import { formatMoneyShort } from "@/lib/drinks";
import type { Drink } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../dashboard/dashboard-context";
import useDayValues, { type Measure } from "../../hooks/use-day-values";
import DropLegend from "../sheet/drop-legend";
import YearSheet from "../sheet/year-sheet";
import MeasureToggle from "./measure-toggle";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "long",
  day: "numeric",
};

export default function SheetSection({ drinks }: { drinks: readonly Drink[] }) {
  const { today, earliest, range, focus, setFocus, sheetYear, setSheetYear } =
    useDashboard();
  const { t, i18n } = useTranslation("dashboard");
  const [measure, setMeasure] = useState<Measure>("drinks");
  const { canSpend, spent, counts, steps, levelOf, tileLabel, currency } =
    useDayValues(drinks, measure, DATE_FORMAT);
  const money = (cents: number) =>
    formatMoneyShort(cents, currency, i18n.language);
  const minYear = dayParts(earliest).year;
  const maxYear = dayParts(today).year;

  const selectDay = (day: string) =>
    setFocus(focus?.day === day ? null : { day });

  return (
    <section aria-labelledby="sheet-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <h2
            id="sheet-heading"
            className="mr-2 font-kai text-xl text-text tabular-nums"
          >
            {sheetYear}
          </h2>
          <button
            type="button"
            disabled={sheetYear <= minYear}
            onClick={() => setSheetYear(sheetYear - 1)}
            className="icon-btn size-10 disabled:opacity-30 sm:size-9"
            aria-label={t("previousYear")}
          >
            <ChevronLeft size={17} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            disabled={sheetYear >= maxYear}
            onClick={() => setSheetYear(sheetYear + 1)}
            className="icon-btn size-10 disabled:opacity-30 sm:size-9"
            aria-label={t("nextYear")}
          >
            <ChevronRight size={17} strokeWidth={1.5} />
          </button>
        </div>
        <MeasureToggle
          spent={spent}
          canSpend={canSpend}
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
        levelOf={levelOf}
        formatTotal={
          spent ? (cents) => (cents > 0 ? money(cents) : "") : undefined
        }
      />

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
