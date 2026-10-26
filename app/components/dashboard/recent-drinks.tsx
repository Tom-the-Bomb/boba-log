"use client";

import { sortNewestFirst } from "@/lib/dashboard-metrics";
import { addDays, formatDay } from "@/lib/date";
import { translateShopName } from "@/lib/default-shops";
import { formatMoney } from "@/lib/drinks";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../dashboard/dashboard-context";
import { useUser } from "../../providers/user-provider";

const RECENT_COUNT = 5;

export default function RecentDrinks() {
  const { user } = useUser();
  const { today, setFocus } = useDashboard();
  const { t, i18n } = useTranslation("dashboard");

  const recent = useMemo(
    () => sortNewestFirst(user?.drinks ?? []).slice(0, RECENT_COUNT),
    [user?.drinks],
  );

  if (!user || user.shops.length === 0) {
    return null;
  }

  const shopsById = new Map(user.shops.map((shop) => [shop.id, shop]));
  const yesterday = addDays(today, -1);

  function dayLabel(day: string) {
    if (day === today) {
      return t("today");
    }
    if (day === yesterday) {
      return t("yesterday");
    }
    return formatDay(day, i18n.language, { month: "short", day: "numeric" });
  }

  return (
    <section aria-labelledby="recent-heading">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
        <h2 id="recent-heading" className="font-kai text-xl text-text">
          {t("recent")}
        </h2>
        <Link
          href="/dashboard/drinks"
          className="tap-target relative inline-flex items-center gap-1 text-xs text-accent-ink hover:underline"
        >
          {t("allDrinks")}
          <ArrowRight size={13} strokeWidth={1.5} />
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="py-4 text-sm text-text-2">{t("recentEmpty")}</p>
      ) : (
        <ul>
          {recent.map((drink) => {
            const shop = shopsById.get(drink.shopId);
            const shopName = shop
              ? translateShopName(shop.name, i18n.language)
              : "";
            return (
              <li key={drink.id} className="border-b border-rule">
                <button
                  type="button"
                  onClick={() => {
                    setFocus({ day: drink.day, drinkId: drink.id });
                  }}
                  className="grid w-full grid-cols-[4.5rem_minmax(0,1fr)_auto] items-baseline gap-3 px-3 py-2.5 text-left text-sm hover:bg-hover pointer-coarse:py-3"
                >
                  <span className="text-text-2">{dayLabel(drink.day)}</span>
                  <span className="truncate text-text">
                    {shopName}
                    {drink.name && (
                      <span className="text-text-2"> · {drink.name}</span>
                    )}
                  </span>
                  <span className="num text-text-2">
                    {drink.priceCents === null
                      ? ""
                      : formatMoney(
                          drink.priceCents,
                          user.currency,
                          i18n.language,
                        )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
