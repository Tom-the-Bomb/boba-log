"use client";

import {
  formatShortDateUTC,
  inRangeInclusiveISO,
  parseDateStringUTC,
  sameDayISO,
  toDateStringUTC,
} from "@/lib/date";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface DateRangeSliderProps {
  startDate: string;
  endDate: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  minDate: string;
  maxDate: string;
}

type SelectionPhase = "idle" | "selecting-end";

const DAY_MS = 86_400_000;

export default function DateRangeSlider({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  minDate,
  maxDate,
}: DateRangeSliderProps) {
  const { t } = useTranslation("dashboard");

  const [viewYear, setViewYear] = useState(() => new Date().getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getUTCMonth());
  const [phase, setPhase] = useState<SelectionPhase>("idle");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const minDay = useMemo(() => parseDateStringUTC(minDate), [minDate]);
  const maxDay = useMemo(() => parseDateStringUTC(maxDate), [maxDate]);

  useEffect(() => {
    if (!endDate) {
      return;
    }
    const end = parseDateStringUTC(endDate);
    if (Number.isNaN(end.getTime())) {
      return;
    }
    setViewYear(end.getUTCFullYear());
    setViewMonth(end.getUTCMonth());
  }, [endDate]);

  const handleDayClick = useCallback(
    (day: string) => {
      if (phase === "idle") {
        onStartChange(day);
        onEndChange(day);
        setPhase("selecting-end");
        return;
      }

      if (day < startDate) {
        onStartChange(day);
      } else {
        onEndChange(day);
      }
      setPhase("idle");
    },
    [phase, startDate, onStartChange, onEndChange],
  );

  if (!startDate || !endDate || !minDate || !maxDate) {
    return null;
  }

  const daysInMonth = new Date(
    Date.UTC(viewYear, viewMonth + 1, 0),
  ).getUTCDate();
  const firstDayOfWeek = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();

  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      toDateStringUTC(new Date(Date.UTC(viewYear, viewMonth, day))),
    );
  }

  const applyPreset = (start: Date, end: Date) => {
    const clampedStart = start < minDay ? minDay : start;
    const clampedEnd = end > maxDay ? maxDay : end;

    onStartChange(toDateStringUTC(clampedStart));
    onEndChange(toDateStringUTC(clampedEnd));
    setPhase("idle");
    setCalendarOpen(false);
  };

  const presets = [
    {
      label: t("preset7Days"),
      apply: () => applyPreset(new Date(maxDay.getTime() - 6 * DAY_MS), maxDay),
    },
    {
      label: t("preset30Days"),
      apply: () =>
        applyPreset(new Date(maxDay.getTime() - 29 * DAY_MS), maxDay),
    },
    {
      label: t("presetThisYear"),
      apply: () =>
        applyPreset(new Date(Date.UTC(maxDay.getUTCFullYear(), 0, 1)), maxDay),
    },
    { label: t("presetAllTime"), apply: () => applyPreset(minDay, maxDay) },
  ];

  const getDayClasses = (day: string): string => {
    const isStart = sameDayISO(day, startDate);
    const isEnd = sameDayISO(day, endDate);
    const isInRange = inRangeInclusiveISO(day, startDate, endDate);
    const isDisabled = day < minDate || day > maxDate;
    const isToday = day === toDateStringUTC(new Date());

    const baseClass =
      "relative z-10 flex h-8 w-8 items-center justify-center text-xs transition-colors duration-100";

    if (isDisabled) {
      return `${baseClass} cursor-not-allowed text-tea-stone/50`;
    }
    if (isStart || isEnd) {
      return `${baseClass} cursor-pointer rounded-full bg-tea-sage text-tea-white font-medium`;
    }
    if (isInRange) {
      return `${baseClass} cursor-pointer bg-tea-sage/15 tea-text-primary`;
    }
    if (isToday) {
      return `${baseClass} cursor-pointer tea-text-accent font-medium`;
    }

    return `${baseClass} cursor-pointer tea-text-primary hover:bg-tea-mist rounded-full`;
  };

  const getRangeBackground = (day: string | null, index: number): string => {
    if (!day) {
      return "";
    }

    const isInRange = inRangeInclusiveISO(day, startDate, endDate);
    const isStart = sameDayISO(day, startDate);
    const isEnd = sameDayISO(day, endDate);

    if (!isInRange || startDate === endDate) {
      return "";
    }

    const col = index % 7;
    if (isStart) {
      return "cal-range-start";
    }
    if (isEnd) {
      return "cal-range-end";
    }
    if (col === 0) {
      return "cal-range-row-start";
    }
    if (col === 6) {
      return "cal-range-row-end";
    }
    return "cal-range-mid";
  };

  const selectPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((current) => current - 1);
      return;
    }
    setViewMonth((current) => current - 1);
  };

  const selectNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((current) => current + 1);
      return;
    }
    setViewMonth((current) => current + 1);
  };

  return (
    <section className="w-full" aria-label="Date range selector">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={preset.apply}
            className="tea-mini-tab tea-border-accent-hover tea-text-muted tea-hover-text-primary border-b border-transparent pb-0.5"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setCalendarOpen((current) => !current);
          setPhase("idle");
        }}
        className="tea-text-primary tea-hover-text-accent mx-auto mt-4 flex items-center gap-2 text-sm"
      >
        <span className="font-medium">{formatShortDateUTC(t, startDate)}</span>
        <span className="tea-text-muted">&ndash;</span>
        <span className="font-medium">{formatShortDateUTC(t, endDate)}</span>
        <ChevronDown
          className={`tea-text-muted h-3 w-3 transition-transform duration-200 ${calendarOpen ? "rotate-180" : ""}`}
        />
      </button>

      {calendarOpen && phase === "selecting-end" && (
        <p className="tea-text-accent mt-2 text-center text-[10px] tracking-[0.15em]">
          {t("selectEndDate")}
        </p>
      )}

      {calendarOpen && (
        <div className="mx-auto mt-4 w-full max-w-xs">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={selectPrevMonth}
              className="tea-text-muted tea-hover-text-primary flex h-7 w-7 items-center justify-center transition-colors"
              aria-label={t("previousMonth")}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="tea-text-primary text-xs font-medium tracking-widest">
              {t(`monthNames[${viewMonth}]`)} {viewYear}
            </span>
            <button
              type="button"
              onClick={selectNextMonth}
              className="tea-text-muted tea-hover-text-primary flex h-7 w-7 items-center justify-center transition-colors"
              aria-label={t("nextMonth")}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0">
            {Array.from({ length: 7 }).map((_, index) => {
              const label = t(`weekdayNames[${index}]`);
              return (
                <div
                  key={label}
                  className="tea-text-muted flex h-8 items-center justify-center text-[10px] tracking-widest uppercase"
                >
                  {label}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 gap-0">
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div key={`empty-col${index % 7}`} className="h-8 w-full" />
                );
              }

              const isDisabled = day < minDate || day > maxDate;
              const rangeBackground = getRangeBackground(day, index);

              return (
                <div
                  key={day}
                  className={`relative flex items-center justify-center ${rangeBackground}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isDisabled) {
                        handleDayClick(day);
                      }
                    }}
                    disabled={isDisabled}
                    className={getDayClasses(day)}
                    aria-label={formatShortDateUTC(t, day)}
                  >
                    {parseDateStringUTC(day).getUTCDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
