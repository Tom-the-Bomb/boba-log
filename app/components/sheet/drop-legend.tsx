"use client";

import { useTranslation } from "react-i18next";
import TeaDrop from "./tea-drop";

const COUNT_LABELS = ["1", "2", "3", "4+"];

/** The four drop sizes, labelled by drinks a day unless told otherwise. */
export default function DropLegend({
  caption,
  labels = COUNT_LABELS,
}: {
  caption?: string;
  labels?: readonly string[];
}) {
  const { t } = useTranslation("dashboard");

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-2">
      <li className="text-text-3">{caption ?? t("drinksADay")}</li>
      {labels.map((label, index) => (
        <li key={index} className="num flex items-center gap-1.5">
          <span className="size-5">
            <TeaDrop count={index + 1} showCount={false} />
          </span>
          {label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block size-4 rounded-full outline-[1.5px] outline-seal outline-dashed"
        />
        {t("legendToday")}
      </li>
    </ul>
  );
}
