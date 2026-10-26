"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface RemovedToastProps {
  onUndo: () => void;
  /** Escape on Undo: let the toast go and return to the list. */
  onDismiss: () => void;
  /** Removed from the keyboard: Undo takes focus so it is one key away. */
  autoFocus?: boolean;
  /** Focus moved elsewhere, by the visitor's choice: let the toast go. */
  onLeave?: () => void;
}

export default function RemovedToast({
  onUndo,
  onDismiss,
  autoFocus = false,
  onLeave,
}: RemovedToastProps) {
  const { t } = useTranslation("dashboard");
  const undoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus) {
      undoRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div className="-my-1 -mr-1.5 flex w-full items-center gap-3">
      <p className="min-w-0 flex-1 truncate">{t("removed")}</p>
      <button
        ref={undoRef}
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
            onLeave?.();
          }
        }}
        className="tap-target relative h-8 shrink-0 rounded-md border border-rule px-2.5 hover:border-rule-strong"
      >
        {t("undo")}
      </button>
    </div>
  );
}
