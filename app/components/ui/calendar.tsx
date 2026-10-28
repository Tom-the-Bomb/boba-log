"use client";

import type { DateValue } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Calendar as AriaCalendar,
  RangeCalendar as AriaRangeCalendar,
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  type CalendarProps,
  type RangeCalendarProps,
} from "react-aria-components";

const NAV_BUTTON =
  "icon-btn size-8 rounded-full outline-none data-disabled:opacity-30 data-focus-visible:focus-ring";

function CalendarBody({ range = false }) {
  return (
    <>
      <header className="mb-2 flex items-center justify-between">
        <Button slot="previous" className={NAV_BUTTON}>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Button>
        <Heading className="font-kai text-base text-text" />
        <Button slot="next" className={NAV_BUTTON}>
          <ChevronRight size={16} strokeWidth={1.5} />
        </Button>
      </header>
      <CalendarGrid weekdayStyle="short" className="w-full">
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className="h-8 text-[11px] font-normal text-text-3">
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody className="[&_td]:py-px">
          {(date) => (
            <CalendarCell
              date={date}
              className={({
                isSelected,
                isSelectionStart,
                isSelectionEnd,
                isOutsideMonth,
                date: cellDate,
              }) =>
                `group block h-9 text-sm outline-none ${
                  isOutsideMonth
                    ? "invisible"
                    : range &&
                        isSelected &&
                        !(isSelectionStart && isSelectionEnd)
                      ? `bg-band ${isSelectionStart || cellDate.day === 1 ? "rounded-s-full" : ""} ${isSelectionEnd || cellDate.day === cellDate.calendar.getDaysInMonth(cellDate) ? "rounded-e-full" : ""} [td:first-child_&]:rounded-s-full [td:last-child_&]:rounded-e-full`
                      : ""
                }`
              }
            >
              {({
                formattedDate,
                isSelected,
                isSelectionStart,
                isSelectionEnd,
                isDisabled,
                isUnavailable,
                isFocusVisible,
                isToday,
              }) => {
                const isEndpoint =
                  isSelected && (!range || isSelectionStart || isSelectionEnd);
                return (
                  <span
                    className={`mx-auto grid size-9 place-items-center rounded-full tabular-nums ${
                      isEndpoint
                        ? "forced-selected bg-accent text-on-accent"
                        : isDisabled || isUnavailable
                          ? "cursor-not-allowed text-text-3 opacity-40"
                          : isToday
                            ? "text-seal group-hover:bg-hover"
                            : "text-text group-hover:bg-hover"
                    } ${isFocusVisible ? "focus-ring" : ""}`}
                  >
                    {formattedDate}
                  </span>
                );
              }}
            </CalendarCell>
          )}
        </CalendarGridBody>
      </CalendarGrid>
    </>
  );
}

export function RangeCalendar<T extends DateValue>(
  props: RangeCalendarProps<T>,
) {
  return (
    <AriaRangeCalendar {...props} className="w-full">
      <CalendarBody range />
    </AriaRangeCalendar>
  );
}

export function Calendar<T extends DateValue>(props: CalendarProps<T>) {
  return (
    <AriaCalendar {...props} className="w-full">
      <CalendarBody />
    </AriaCalendar>
  );
}
