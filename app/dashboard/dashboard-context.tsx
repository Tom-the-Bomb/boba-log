"use client";

import {
  earliestDay,
  presetRange,
  type DayRange,
  type RangePreset,
} from "@/lib/dashboard-metrics";
import { dayParts } from "@/lib/date";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import useToday from "../hooks/use-today";
import { useUser } from "../providers/user-provider";

interface DayFocus {
  day: string;
  drinkId?: number;
  shopId?: number;
}

interface DashboardContextValue {
  today: string;
  earliest: string;
  preset: RangePreset;
  range: DayRange;
  setPreset: (preset: Exclude<RangePreset, "custom">) => void;
  setCustomRange: (range: DayRange) => void;
  focus: DayFocus | null;
  setFocus: (focus: DayFocus | null) => void;
  sheetYear: number;
  setSheetYear: (year: number) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const today = useToday();
  const [preset, setPresetState] = useState<RangePreset>("all");
  const [customRange, setCustomRangeState] = useState<DayRange | null>(null);
  const [focus, setFocusState] = useState<DayFocus | null>(null);
  const [yearOverride, setYearOverride] = useState<number | null>(null);

  const earliest = useMemo(
    () => (user ? earliestDay(user.drinks, user.createdAt) : today),
    [user, today],
  );

  const range = useMemo(
    () =>
      preset === "custom" && customRange
        ? customRange
        : presetRange(preset === "custom" ? "all" : preset, today, earliest),
    [preset, customRange, today, earliest],
  );

  const setPreset = useCallback((next: Exclude<RangePreset, "custom">) => {
    setPresetState(next);
    setYearOverride(null);
  }, []);

  const setCustomRange = useCallback((next: DayRange) => {
    setCustomRangeState(next);
    setPresetState("custom");
    setYearOverride(null);
  }, []);

  const setFocus = useCallback((next: DayFocus | null) => {
    setFocusState(next);
    if (next) {
      setYearOverride(dayParts(next.day).year);
    }
  }, []);

  const value = useMemo<DashboardContextValue>(
    () => ({
      today,
      earliest,
      preset,
      range,
      setPreset,
      setCustomRange,
      focus,
      setFocus,
      sheetYear: yearOverride ?? dayParts(range.end).year,
      setSheetYear: setYearOverride,
    }),
    [
      today,
      earliest,
      preset,
      range,
      setPreset,
      setCustomRange,
      focus,
      setFocus,
      yearOverride,
    ],
  );

  return <DashboardContext value={value}>{children}</DashboardContext>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider.");
  }
  return context;
}
