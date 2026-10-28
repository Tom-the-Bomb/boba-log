"use client";

import { formatDay } from "@/lib/date";
import { EARLIEST_DAY } from "@/lib/drinks";
import { parseDate } from "@internationalized/date";
import { CalendarDays } from "lucide-react";
import { Button, Dialog, DialogTrigger } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { Calendar } from "./calendar";
import { Popover } from "./overlays";

interface DatePickerProps {
  label: string;
  value: string;
  maxDay: string;
  onChange: (day: string) => void;
}

export default function DatePicker({
  label,
  value,
  maxDay,
  onChange,
}: DatePickerProps) {
  const { i18n } = useTranslation();

  return (
    <div>
      <span className="label">{label}</span>
      <DialogTrigger>
        <Button
          aria-label={`${label}: ${formatDay(value, i18n.language)}`}
          className="field flex items-center justify-between gap-3 text-left outline-none data-focus-visible:field-focus"
        >
          <span className="tabular-nums">
            {formatDay(value, i18n.language)}
          </span>
          <CalendarDays size={15} strokeWidth={1.5} className="text-text-2" />
        </Button>
        <Popover placement="bottom start" className="w-72 p-4">
          <Dialog aria-label={label} className="outline-none">
            {({ close }) => (
              <Calendar
                aria-label={label}
                value={parseDate(value)}
                minValue={parseDate(EARLIEST_DAY)}
                maxValue={parseDate(maxDay)}
                onChange={(date) => {
                  onChange(date.toString());
                  close();
                }}
              />
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}
