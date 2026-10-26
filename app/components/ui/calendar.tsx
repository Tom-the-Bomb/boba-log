"use client";

import {
  getLocalTimeZone,
  today as todayDate,
  type DateValue,
} from "@internationalized/date";
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
  "relative tap-target grid size-8 place-items-center rounded-full text-text-2 outline-none hover:bg-hover hover:text-text data-disabled:opacity-30 data-focus-visible:focus-ring";

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
      <CalendarGrid weekdayStyle="short" className="w-full border-collapse">
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className="h-8 text-[11px] font-normal text-text-3">
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody className="[&_td]:p-0 [&_td]:py-px">
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
                date: cellDate,
              }) => {
                const isEndpoint =
                  isSelected && (!range || isSelectionStart || isSelectionEnd);
                const isToday =
                  cellDate.compare(todayDate(getLocalTimeZone())) === 0;
                return (
                  <span
                    className={`num mx-auto grid size-9 cursor-pointer place-items-center rounded-full ${
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

/** A month grid for choosing a span of days, start and end drawn as filled circles joined by a band. */
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
