"use client";

import { sortNewestFirst } from "@/lib/dashboard-metrics";
import { addDays, formatDay } from "@/lib/date";
import { EARLIEST_DAY } from "@/lib/drinks";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../dashboard/dashboard-context";
import useRemoveDrink, { focusEdit } from "../../hooks/use-remove-drink";
import { useUser } from "../../providers/user-provider";
import DrinkForm from "./drink-form";
import DrinkItem from "./drink-item";

export default function DayPanel() {
  const { user, logDrink, updateDrink } = useUser();
  const remove = useRemoveDrink();
  const { focus, setFocus, today } = useDashboard();
  const { t, i18n } = useTranslation("dashboard");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [focusKey, setFocusKey] = useState(focus);
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!focus) {
      return;
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
    if (!panelRef.current?.contains(document.activeElement)) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [focus]);

  useEffect(() => () => setFocus(null), [setFocus]);

  if (focus !== focusKey) {
    setFocusKey(focus);
    setEditingId(focus?.drinkId ?? null);
  }

  const day = focus?.day ?? null;

  if (!day || !user) {
    return null;
  }

  const drinks = sortNewestFirst(
    user.drinks.filter((drink) => drink.day === day),
  );

  const shopsById = new Map(user.shops.map((shop) => [shop.id, shop]));

  function close(fromKeyboard: boolean) {
    const tile = fromKeyboard
      ? document.querySelector<HTMLElement>(`[data-day="${day}"]`)
      : null;
    setFocus(null);
    tile?.focus();
  }

  return (
    <section
      ref={panelRef}
      aria-labelledby="day-panel-heading"
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          !(event.target as HTMLElement).closest("input")
        ) {
          close(true);
        }
      }}
      className="scroll-mt-6 rounded-lg border border-rule bg-surface px-5 pt-4 pb-5 sm:px-6"
    >
      <div className="flex items-start justify-between gap-4">
        <h3
          ref={headingRef}
          id="day-panel-heading"
          tabIndex={-1}
          className="min-w-0 rounded-md font-kai text-xl text-text"
        >
          {formatDay(day, i18n.language, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: day.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric",
          })}
        </h3>
        <div className="-mr-2 flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={day <= EARLIEST_DAY}
            onClick={() => setFocus({ day: addDays(day, -1) })}
            className="icon-btn size-9 disabled:opacity-30"
            aria-label={t("previousDay")}
          >
            <ChevronLeft size={17} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            disabled={day >= today}
            onClick={() => setFocus({ day: addDays(day, 1) })}
            className="icon-btn size-9 disabled:opacity-30"
            aria-label={t("nextDay")}
          >
            <ChevronRight size={17} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={(event) => close(event.detail === 0)}
            className="icon-btn ml-2 size-9"
            aria-label={t("closeDay")}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <p className="mt-0.5 text-sm text-text-2">
        {drinks.length > 0
          ? t("dayCount", { count: drinks.length })
          : t("dayEmpty")}
      </p>

      {drinks.length > 0 && (
        <ul
          data-drink-list="day-panel-heading"
          className="mt-2 divide-y divide-rule border-t border-rule"
        >
          {drinks.map((drink) => (
            <li key={drink.id} data-drink-row={drink.id}>
              {editingId === drink.id ? (
                <div className="py-4">
                  <DrinkForm
                    shops={user.shops}
                    currency={user.currency}
                    drink={drink}
                    initialDay={drink.day}
                    onCancel={() => {
                      setEditingId(null);
                      focusEdit(drink.id);
                    }}
                    onSubmit={async (shopId, input) => {
                      const error = await updateDrink(drink.id, {
                        ...input,
                        shopId,
                      });
                      if (!error) {
                        setEditingId(null);
                        if (input.day === day) {
                          focusEdit(drink.id);
                        } else {
                          setFocus({ day: input.day });
                        }
                      }
                      return error;
                    }}
                  />
                </div>
              ) : (
                <DrinkItem
                  drink={drink}
                  shop={shopsById.get(drink.shopId)}
                  currency={user.currency}
                  onEdit={() => setEditingId(drink.id)}
                  onRemove={(fromKeyboard) => void remove(drink, fromKeyboard)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {user.shops.length > 0 && editingId === null && (
        <div className="mt-4 border-t border-rule pt-4">
          <p className="mb-3 text-sm text-text">{t("addDrink")}</p>
          <DrinkForm
            key={`${day}-${focus?.shopId ?? ""}`}
            shops={user.shops}
            currency={user.currency}
            initialShopId={focus?.shopId}
            initialDay={day}
            onSubmit={async (shopId, input) => {
              const result = await logDrink(shopId, input);
              return typeof result === "string" ? result : null;
            }}
          />
        </div>
      )}
    </section>
  );
}
