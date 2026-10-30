"use client";

import { RANGE_PRESET_KEYS, RANGE_PRESETS } from "@/lib/dashboard-metrics";
import { formatDay } from "@/lib/date";
import { EARLIEST_DAY } from "@/lib/drinks";
import { parseDate } from "@internationalized/date";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button, Dialog, DialogTrigger } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../dashboard/dashboard-context";
import { RangeCalendar } from "../ui/calendar";
import { Popover } from "../ui/overlays";

export function useRangeLabel() {
  const { range, today } = useDashboard();
  const { i18n } = useTranslation();
  const sameYear = range.start.slice(0, 4) === today.slice(0, 4);
  const short = { month: "short", day: "numeric" } as const;
  const long = { month: "short", day: "numeric", year: "numeric" } as const;
  return {
    start: formatDay(range.start, i18n.language, sameYear ? short : long),
    end: formatDay(range.end, i18n.language, sameYear ? short : long),
  };
}

export default function RangePicker() {
  const { preset, range, today, setPreset, setCustomRange } = useDashboard();
  const { t } = useTranslation("dashboard");
  const label = useRangeLabel();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button className="tap-target relative flex h-9 items-center gap-2 rounded-md border border-rule px-3 text-sm whitespace-nowrap text-text outline-none hover:border-rule-strong data-focus-visible:focus-ring">
        <span className="text-text-2">{t(RANGE_PRESET_KEYS[preset])}</span>
        <span className="ml-1 hidden tabular-nums sm:max-md:inline lg:inline">
          {label.start} – {label.end}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={1.5}
          className={`text-text-3 ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>
      <Popover placement="bottom end" className="w-80 p-4">
        <Dialog aria-label={t("range")} className="outline-none">
          <div className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 border-b border-rule pb-3">
            {RANGE_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={preset === value}
                onClick={() => {
                  setPreset(value);
                  setIsOpen(false);
                }}
                className={`border-b pb-0.5 text-[13px] ${
                  preset === value
                    ? "border-accent text-text"
                    : "border-transparent text-text-2 hover:border-rule-strong hover:text-text"
                }`}
              >
                {t(RANGE_PRESET_KEYS[value])}
              </button>
            ))}
          </div>
          <RangeCalendar
            aria-label={t("rangeCustom")}
            value={{ start: parseDate(range.start), end: parseDate(range.end) }}
            defaultFocusedValue={parseDate(range.end)}
            minValue={parseDate(EARLIEST_DAY)}
            maxValue={parseDate(today)}
            onChange={(value) => {
              if (value) {
                setCustomRange({
                  start: value.start.toString(),
                  end: value.end.toString(),
                });
                setIsOpen(false);
              }
            }}
          />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
