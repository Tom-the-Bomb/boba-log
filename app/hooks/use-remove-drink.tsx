"use client";

import type { Drink } from "@/lib/types";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import RemovedToast from "../components/dashboard/removed-toast";
import { useUser } from "../providers/user-provider";

/** A drink's row as shown; the Drinks page draws a table and a phone list. */
function visibleRow(id: number | string) {
  return (
    [
      ...document.querySelectorAll<HTMLElement>(`[data-drink-row="${id}"]`),
    ].find((row) => row.offsetParent !== null) ?? null
  );
}

/** Focuses a row's remove button, or says it could not. */
function focusRemove(row: HTMLElement | null) {
  const button = row?.querySelector<HTMLElement>("[data-remove]");
  button?.focus();
  return Boolean(button);
}

/**
 * Removes a drink at once, with an Undo in the toast that logs it back
 * exactly as it was, so a stray tap on the bin never costs a record.
 *
 * Focus stays in the list: it moves to the next drink (or the previous, or
 * the list's heading). Removed from the keyboard, Undo takes focus instead,
 * one key away; Escape returns to the list.
 */
export default function useRemoveDrink() {
  const { removeDrink, logDrink } = useUser();
  const { t } = useTranslation("dashboard");

  return useCallback(
    async (drink: Drink, fromKeyboard = false) => {
      // Where focus belongs once this row is gone, decided while it exists.
      const row = visibleRow(drink.id);
      const rows = [...(row?.parentElement?.children ?? [])].filter((el) =>
        el.hasAttribute("data-drink-row"),
      );
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

      const error = await removeDrink(drink.id);
      if (error) {
        toast.error(t(error));
        return;
      }
      if (!fromKeyboard) {
        returnFocus();
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
              // Back on the drink it brought back.
              requestAnimationFrame(() => {
                if (!focusRemove(visibleRow(result.id))) {
                  returnFocus();
                }
              });
            }}
          />
        ),
        // From the keyboard it waits for the visitor rather than a timer.
        { duration: fromKeyboard ? Infinity : 6000 },
      );
    },
    [removeDrink, logDrink, t],
  );
}
