"use client";

import { useTranslation } from "react-i18next";
import TeaDrop from "../sheet/tea-drop";

interface LoggedToastProps {
  shopName: string;
  onUndo: () => void;
  onAddDetails: () => void;
}

export default function LoggedToast({
  shopName,
  onUndo,
  onAddDetails,
}: LoggedToastProps) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="-my-1 -mr-1.5 flex w-full items-center gap-3">
      <span aria-hidden="true" className="size-5 shrink-0">
        <TeaDrop count={3} showCount={false} />
      </span>
      <p className="line-clamp-2 min-w-0 flex-1">
        {t("loggedAt", { name: shopName })}
      </p>
      <button
        type="button"
        onClick={onAddDetails}
        className="tap-target relative h-8 shrink-0 rounded-md border border-transparent px-2.5 text-accent-ink decoration-1 underline-offset-[0.25em] hover:underline"
      >
        {t("addDetails")}
      </button>
      <button
        type="button"
        onClick={onUndo}
        className="tap-target relative h-8 shrink-0 rounded-md border border-rule px-2.5 hover:border-rule-strong"
      >
        {t("undo")}
      </button>
    </div>
  );
}
