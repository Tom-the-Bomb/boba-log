"use client";

import { useTranslation } from "react-i18next";

interface RemovedToastProps {
  onUndo: () => void;
  onDismiss: () => void;
  autoFocus: boolean;
  onLeave: () => void;
}

export default function RemovedToast({
  onUndo,
  onDismiss,
  autoFocus,
  onLeave,
}: RemovedToastProps) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="-my-1 -mr-1.5 flex w-full items-center gap-3">
      <p className="min-w-0 flex-1 truncate">{t("removed")}</p>
      <button
        autoFocus={autoFocus}
        type="button"
        onClick={onUndo}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onDismiss();
          }
        }}
        onBlur={(event) => {
          const toast = event.currentTarget.closest("[data-sonner-toast]");
          if (!toast?.contains(event.relatedTarget as Node | null)) {
            onLeave();
          }
        }}
        className="tap-target relative h-8 shrink-0 rounded-md border border-rule px-2.5 hover:border-rule-strong"
      >
        {t("undo")}
      </button>
    </div>
  );
}
