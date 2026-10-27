"use client";

import type { DayRange } from "@/lib/dashboard-metrics";
import {
  addDays,
  dayFromParts,
  dayParts,
  daysInMonth,
  monthName,
} from "@/lib/date";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useTouchScrub from "../../hooks/use-touch-scrub";
import TeaDrop from "./tea-drop";

interface YearSheetProps {
  year: number;
  counts: ReadonlyMap<string, number>;
  today: string;
  /** Days outside the range recede. */
  range?: DayRange;
  selectedDay?: string | null;
  /** Makes each day a button. */
  onSelectDay?: (day: string) => void;
  label: string;
  tileLabel: (day: string, count: number) => string;
  /** Sizes each drop from its value (e.g. money spent) instead of by count;
   *  drops then carry no numerals. */
  levelOf?: (value: number) => number;
  /** Writes the month totals, e.g. as money. */
  formatTotal?: (value: number) => string;
}

const DAY_HEADS = new Set([1, 5, 10, 15, 20, 25, 31]);
const MONTHS = Array.from({ length: 12 }, (_, month) => month);
const DATES = Array.from({ length: 31 }, (_, index) => index + 1);

/** Where an arrow, Home or End key moves from `day`: a day, null past the
 *  first or last month, or undefined for any other key. */
function keyTarget(key: string, day: string, year: number) {
  const { month, date } = dayParts(day);
  switch (key) {
    case "ArrowLeft":
      return addDays(day, -1);
    case "ArrowRight":
      return addDays(day, 1);
    case "ArrowUp":
    case "ArrowDown": {
      const target = month + (key === "ArrowUp" ? -1 : 1);
      return target >= 0 && target <= 11
        ? dayFromParts(year, target, Math.min(date, daysInMonth(year, target)))
        : null;
    }
    case "Home":
      return dayFromParts(year, month, 1);
    case "End":
      return dayFromParts(year, month, daysInMonth(year, month));
    default:
      return undefined;
  }
}

interface DayTileProps {
  day: string;
  count: number;
  today: string;
  range?: DayRange;
  selectedDay?: string | null;
  tabStop: string;
  onSelectDay?: (day: string) => void;
  tileLabel: (day: string, count: number) => string;
  levelOf?: (value: number) => number;
}

/** A tile's ring: the selected day, else today, else none. Days outside the
 *  range recede. */
function tileClass(
  day: string,
  today: string,
  selectedDay?: string | null,
  range?: DayRange,
) {
  const outside = range !== undefined && (day < range.start || day > range.end);
  const ring =
    day === selectedDay
      ? "outline-[1.5px] outline-offset-2 outline-text"
      : day === today
        ? "outline-[1.5px] outline-offset-1 outline-seal outline-dashed"
        : "";
  return [
    "relative block aspect-square w-full rounded-full",
    outside && day <= today ? "opacity-35" : "",
    ring,
  ].join(" ");
}

/** A drop for a day with drinks, a faint dot for one without. */
function TileMark({
  count,
  future,
  levelOf,
}: {
  count: number;
  future: boolean;
  levelOf?: (value: number) => number;
}) {
  if (count > 0) {
    return (
      <span className="absolute inset-0">
        <TeaDrop
          count={levelOf ? levelOf(count) : count}
          showCount={!levelOf}
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`absolute top-1/2 left-1/2 size-[3px] -translate-1/2 rounded-full ${
        future ? "bg-text/10" : "bg-text/30"
      }`}
    />
  );
}

function DayTile({
  day,
  count,
  today,
  range,
  selectedDay,
  tabStop,
  onSelectDay,
  tileLabel,
  levelOf,
}: DayTileProps) {
  const future = day > today;
  const className = tileClass(day, today, selectedDay, range);
  const content = <TileMark count={count} future={future} levelOf={levelOf} />;

  if (onSelectDay && !future) {
    return (
      <button
        type="button"
        data-day={day}
        tabIndex={day === tabStop ? 0 : -1}
        onClick={() => onSelectDay(day)}
        aria-label={tileLabel(day, count)}
        aria-pressed={day === selectedDay}
        className={`${className} hover:bg-hover`}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={className}
      title={future ? undefined : tileLabel(day, count)}
    >
      {content}
    </span>
  );
}

interface MonthRowProps extends Omit<DayTileProps, "day" | "count"> {
  year: number;
  month: number;
  name: string;
  counts: ReadonlyMap<string, number>;
  /** Another month is selected, so this one steps back. */
  recede: boolean;
  formatTotal?: (value: number) => string;
}

function MonthRow({
  year,
  month,
  name,
  counts,
  recede,
  formatTotal,
  ...tile
}: MonthRowProps) {
  const days = DATES.slice(0, daysInMonth(year, month)).map((date) =>
    dayFromParts(year, month, date),
  );
  const total = days.reduce((sum, day) => sum + (counts.get(day) ?? 0), 0);
  const isFuture = days[0] > tile.today;
  const fade = recede ? "opacity-55" : "";

  return (
    <div className="grid grid-cols-[1.75rem_1fr_1.5rem] items-center gap-x-1.5 sm:grid-cols-[2.75rem_1fr_2.5rem] sm:gap-x-3">
      <span className="text-xs text-text-2">{name}</span>
      <div
        data-month={month}
        className={`grid grid-cols-31 gap-px sm:gap-1 ${fade}`}
      >
        {DATES.map((date) => {
          const day = days[date - 1];
          return day ? (
            <DayTile
              key={date}
              day={day}
              count={counts.get(day) ?? 0}
              {...tile}
            />
          ) : (
            <span key={date} aria-hidden="true" />
          );
        })}
      </div>
      <span
        className={`num min-h-5 text-right leading-5 ${total > 0 ? "text-text" : "text-text-3"} ${formatTotal ? "text-[11px] sm:text-[13px]" : "text-[13px]"} ${fade}`}
      >
        {isFuture ? "" : formatTotal ? formatTotal(total) : total}
      </span>
    </div>
  );
}

export default function YearSheet({
  year,
  counts,
  today,
  range,
  selectedDay,
  onSelectDay,
  label,
  tileLabel,
  levelOf,
  formatTotal,
}: YearSheetProps) {
  const { i18n } = useTranslation();
  const lastDay = `${year}-12-31` < today ? `${year}-12-31` : today;
  const selectedMonth =
    selectedDay && dayParts(selectedDay).year === year
      ? dayParts(selectedDay).month
      : null;

  // The hovered, focused or touched day, named in a small label above it.
  const [tip, setTip] = useState<{ text: string; x: number; y: number }>();
  const monthsRef = useRef<HTMLDivElement>(null);

  /** Names `day` with its label's foot at `bottom`, centred near `x`. */
  function placeTip(day: string, x: number, bottom: number) {
    setTip({
      text: tileLabel(day, counts.get(day) ?? 0),
      x: Math.min(Math.max(x, 100), window.innerWidth - 100),
      y: bottom,
    });
  }

  function showTip(target: EventTarget) {
    const cell = (target as Element).closest<HTMLElement>("[data-day]");
    if (!cell) {
      setTip(undefined);
      return;
    }
    const rect = cell.getBoundingClientRect();
    placeTip(cell.dataset.day!, rect.left + rect.width / 2, rect.top - 8);
  }

  /** The day under a point: the nearest month's row, then its column, up to
   *  today. Gaps and the margins still land on a day. */
  function dayAt(x: number, y: number) {
    const rows =
      monthsRef.current?.querySelectorAll<HTMLElement>("[data-month]");
    let row: HTMLElement | undefined;
    let nearest = Infinity;
    rows?.forEach((candidate) => {
      const box = candidate.getBoundingClientRect();
      const distance = Math.abs(y - (box.top + box.height / 2));
      if (distance < nearest) {
        nearest = distance;
        row = candidate;
      }
    });
    if (!row) {
      return null;
    }
    const box = row.getBoundingClientRect();
    const pitch =
      (box.width + parseFloat(getComputedStyle(row).columnGap)) / 31;
    const month = Number(row.dataset.month);
    const date = Math.min(
      Math.max(Math.floor((x - box.left) / pitch) + 1, 1),
      daysInMonth(year, month),
    );
    const day = dayFromParts(year, month, date);
    if (day <= lastDay) {
      return day;
    }
    return dayFromParts(year, month, 1) <= lastDay ? lastDay : null;
  }

  // A finger slides along the sheet to find a day, named above the finger,
  // and lifts to open it.
  const scrub = useTouchScrub({
    pick: dayAt,
    onPreview: (day, x) => {
      const row = day
        ? monthsRef.current?.querySelector(
            `[data-month="${dayParts(day).month}"]`,
          )
        : null;
      if (!day || !row) {
        setTip(undefined);
        return;
      }
      placeTip(day, x, row.getBoundingClientRect().top - 28);
    },
    onCommit: (day) => onSelectDay?.(day),
  });

  useEffect(() => {
    if (!tip) {
      return;
    }
    const hide = () => setTip(undefined);
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, [tip]);

  // One tile is tabbable at a time; arrow keys move between days.
  const tabStop =
    selectedDay && selectedDay.startsWith(`${year}-`) ? selectedDay : lastDay;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const day = (event.target as HTMLElement).dataset.day;
    if (!day || !onSelectDay) {
      return;
    }
    let next = keyTarget(event.key, day, year);
    if (next === undefined) {
      return;
    }

    event.preventDefault();
    if (!next || !next.startsWith(`${year}-`)) {
      return;
    }
    if (next > lastDay) {
      next = lastDay;
    }
    event.currentTarget
      .querySelector<HTMLElement>(`[data-day="${next}"]`)
      ?.focus();
  }

  return (
    <div
      role="group"
      aria-label={label}
      onKeyDown={handleKeyDown}
      onPointerOver={(event) => {
        // Touch opens the day instead; the label is for pointers and keys.
        if (event.pointerType !== "touch") {
          showTip(event.target);
        }
      }}
      onPointerLeave={() => setTip(undefined)}
      onFocus={(event) => {
        // A tap focuses its tile too; only keyboard focus names the day.
        if (event.target.matches(":focus-visible")) {
          showTip(event.target);
        }
      }}
      onBlur={() => setTip(undefined)}
      className="@container select-none"
    >
      {tip && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md border border-rule bg-surface px-2.5 py-1 font-kai text-[13px] whitespace-nowrap text-text shadow-(--lift)"
          style={{ left: tip.x, top: tip.y }}
        >
          {tip.text}
        </div>
      )}
      <div
        aria-hidden="true"
        className="mb-2 grid grid-cols-[1.75rem_1fr_1.5rem] gap-x-1.5 sm:grid-cols-[2.75rem_1fr_2.5rem] sm:gap-x-3"
      >
        <span />
        <div className="grid grid-cols-31 gap-px sm:gap-1">
          {DATES.map((date) => (
            <span
              key={date}
              className="text-center text-[10px] leading-none text-text-3"
            >
              {DAY_HEADS.has(date) ? date : ""}
            </span>
          ))}
        </div>
        <span />
      </div>

      <div
        ref={monthsRef}
        {...(onSelectDay ? scrub : {})}
        className={`space-y-[5px] sm:space-y-1.5 ${onSelectDay ? "touch-pan-y touch-pinch-zoom" : ""}`}
      >
        {MONTHS.map((month) => (
          <MonthRow
            key={month}
            year={year}
            month={month}
            name={monthName(month, i18n.language)}
            counts={counts}
            recede={selectedMonth !== null && selectedMonth !== month}
            formatTotal={formatTotal}
            today={today}
            range={range}
            selectedDay={selectedDay}
            tabStop={tabStop}
            onSelectDay={onSelectDay}
            tileLabel={tileLabel}
            levelOf={levelOf}
          />
        ))}
      </div>
    </div>
  );
}
