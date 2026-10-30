"use client";

import { useTranslation } from "react-i18next";
import type { Measure } from "../../hooks/use-day-values";
import { Segmented } from "../ui/fields";

export default function MeasureToggle({
  spent,
  canSpend,
  onChange,
}: {
  spent: boolean;
  canSpend: boolean;
  onChange: (measure: Measure) => void;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <Segmented
      compact
      label={t("trendMeasure")}
      value={spent ? "spent" : "drinks"}
      options={[
        { value: "drinks", label: t("trendDrinks") },
        { value: "spent", label: t("trendSpent"), disabled: !canSpend },
      ]}
      onChange={onChange}
    />
  );
}
