"use client";

import type { Drink } from "@/lib/types";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import RemovedToast from "../components/dashboard/removed-toast";
import { useUser } from "../providers/user-provider";

// The Drinks page renders a table and a phone list; only one is visible.
function visibleRow(id: number | string) {
  return (
    [
      ...document.querySelectorAll<HTMLElement>(`[data-drink-row="${id}"]`),
    ].find((row) => row.offsetParent !== null) ?? null
  );
}

function focusRemove(row: HTMLElement | null) {
  const button = row?.querySelector<HTMLElement>("[data-remove]");
  button?.focus();
  return Boolean(button);
}

export function focusEdit(id: number) {
  requestAnimationFrame(() =>
    visibleRow(id)?.querySelector<HTMLElement>("[data-edit]")?.focus(),
  );
}

export default function useRemoveDrink() {
  const { removeDrink, logDrink } = useUser();
  const { t } = useTranslation("dashboard");

  return useCallback(
    async (drink: Drink, fromKeyboard = false) => {
      const row = visibleRow(drink.id);
      const rows = [...(row?.parentElement?.children ?? [])];
      const index = row ? rows.indexOf(row) : -1;
      const neighbour = (rows[index + 1] ?? rows[index - 1])?.getAttribute(
        "data-drink-row",
      );
      const headingId = row
        ?.closest("[data-drink-list]")
        ?.getAttribute("data-drink-list");
      const returnFocus = () =>
        requestAnimationFrame(() => {
          if (!neighbour || !focusRemove(visibleRow(neighbour))) {
            document.getElementById(headingId ?? "")?.focus();
          }
        });

      const pending = removeDrink(drink);
      if (!fromKeyboard) {
        returnFocus();
      }
      const error = await pending;
      if (error) {
        toast.error(t(error));
        if (fromKeyboard) {
          requestAnimationFrame(() => focusRemove(visibleRow(drink.id)));
        }
        return;
      }
      toast.custom(
        (id) => (
          <RemovedToast
            autoFocus={fromKeyboard}
            onLeave={() => toast.dismiss(id)}
            onDismiss={() => {
              toast.dismiss(id);
              returnFocus();
            }}
            onUndo={async () => {
              toast.dismiss(id);
              const result = await logDrink(drink.shopId, {
                day: drink.day,
                name: drink.name,
                priceCents: drink.priceCents,
                note: drink.note,
              });
              if (typeof result === "string") {
                toast.error(t(result));
                returnFocus();
                return;
              }
              requestAnimationFrame(() => {
                if (!focusRemove(visibleRow(result.id))) {
                  returnFocus();
                }
              });
            }}
          />
        ),
        { duration: fromKeyboard ? Infinity : 6000 },
      );
    },
    [removeDrink, logDrink, t],
  );
}
