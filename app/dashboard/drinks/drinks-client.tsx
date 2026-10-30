"use client";

import {
  drinksInRange,
  sortNewestFirst,
  spendSummary,
} from "@/lib/dashboard-metrics";
import { formatDay } from "@/lib/date";
import { translateShopName } from "@/lib/default-shops";
import { formatMoney } from "@/lib/drinks";
import type { Drink } from "@/lib/types";
import { Download } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DrinkForm from "../../components/dashboard/drink-form";
import { DrinkActions } from "../../components/dashboard/drink-item";
import ShopAvatar from "../../components/dashboard/shop-avatar";
import { Select } from "../../components/ui/fields";
import useRemoveDrink from "../../hooks/use-remove-drink";
import { useUser } from "../../providers/user-provider";
import { useDashboard } from "../dashboard-context";

const PAGE_SIZE = 50;

export default function DrinksClient() {
  const { user, updateDrink } = useUser();
  const remove = useRemoveDrink();
  const { range, preset, today } = useDashboard();
  const { t, i18n } = useTranslation("dashboard");
  const [shopFilter, setShopFilter] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const rangeKey = preset === "custom" ? `${range.start}/${range.end}` : preset;
  const [shownRangeKey, setShownRangeKey] = useState(rangeKey);
  if (rangeKey !== shownRangeKey) {
    setShownRangeKey(rangeKey);
    setVisible(PAGE_SIZE);
  }
  const [editingId, setEditingId] = useState<number | null>(null);

  const drinks = useMemo(() => {
    const inRange = drinksInRange(user?.drinks ?? [], range);
    const filtered =
      shopFilter === "all"
        ? inRange
        : inRange.filter((drink) => String(drink.shopId) === shopFilter);
    return sortNewestFirst(filtered);
  }, [user?.drinks, range, shopFilter]);

  if (!user) {
    return null;
  }

  const shopsById = new Map(user.shops.map((shop) => [shop.id, shop]));
  const spend = spendSummary(drinks);
  const shown = drinks.slice(0, visible);

  const shopName = (drink: Drink) => {
    const shop = shopsById.get(drink.shopId);
    return shop ? translateShopName(shop.name, i18n.language) : "";
  };
  const price = (drink: Drink) =>
    drink.priceCents === null
      ? ""
      : formatMoney(drink.priceCents, user.currency, i18n.language);
  const date = (drink: Drink) =>
    formatDay(drink.day, i18n.language, {
      month: "short",
      day: "numeric",
      year: drink.day.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric",
    });

  const editor = (drink: Drink) => (
    <DrinkForm
      key={drink.id}
      shops={user.shops}
      currency={user.currency}
      drink={drink}
      showDate
      initialDay={drink.day}
      maxDay={today}
      submitLabel={t("save")}
      onCancel={() => setEditingId(null)}
      onSubmit={async (shopId, input) => {
        const error = await updateDrink(drink.id, { ...input, shopId });
        if (!error) {
          setEditingId(null);
        }
        return error;
      }}
    />
  );

  const actions = (drink: Drink) => (
    <DrinkActions
      drink={drink}
      onEdit={() => setEditingId(drink.id)}
      onRemove={(fromKeyboard) => void remove(drink, fromKeyboard)}
    />
  );

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-8 sm:pt-10 lg:px-12"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b border-rule pb-6">
        <div>
          <h1
            id="drinks-heading"
            tabIndex={-1}
            className="rounded-md font-kai text-4xl text-text"
          >
            {t("drinksTitle")}
          </h1>
          <p className="mt-2 text-sm text-text-2">
            {t("dayCount", { count: drinks.length })}
            {spend.priced > 0 &&
              ` · ${formatMoney(spend.cents, user.currency, i18n.language)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            label={t("colShop")}
            hideLabel
            value={shopFilter}
            className="w-52"
            options={[
              { value: "all", label: t("allShops") },
              ...user.shops.map((shop) => ({
                value: String(shop.id),
                label: translateShopName(shop.name, i18n.language),
              })),
            ]}
            onChange={(value) => {
              setShopFilter(value);
              setVisible(PAGE_SIZE);
            }}
          />
          <a href="/api/user/export" download className="btn btn-quiet">
            <Download size={15} strokeWidth={1.5} />
            {t("exportCsv")}
          </a>
        </div>
      </div>

      {user.drinks.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-kai text-xl text-text-2">{t("noDrinksYet")}</p>
          <Link href="/dashboard" className="link mt-3 inline-block text-sm">
            {t("logFirstDrink")}
          </Link>
        </div>
      ) : drinks.length === 0 ? (
        <p className="py-16 text-center font-kai text-xl text-text-2">
          {t("noDrinksInRange")}
        </p>
      ) : (
        <>
          <table className="hidden w-full table-fixed text-sm md:table">
            <thead>
              <tr className="border-b border-rule text-left text-xs text-text-2">
                <th scope="col" className="w-28 py-3 pl-3 font-normal">
                  {t("colDate")}
                </th>
                <th scope="col" className="w-52 py-3 font-normal">
                  {t("colShop")}
                </th>
                <th scope="col" className="py-3 font-normal">
                  {t("colDrink")}
                </th>
                <th scope="col" className="w-32 py-3 text-right font-normal">
                  {t("colPrice")}
                </th>
                <th scope="col" className="py-3 pl-8 font-normal">
                  {t("colNote")}
                </th>
                <th scope="col" className="w-24 py-3 pr-3">
                  <span className="sr-only">{t("edit")}</span>
                </th>
              </tr>
            </thead>
            <tbody data-drink-list="drinks-heading">
              {shown.map((drink) =>
                editingId === drink.id ? (
                  <tr
                    key={drink.id}
                    data-drink-row={drink.id}
                    className="border-b border-rule"
                  >
                    <td colSpan={6} className="px-3 py-5">
                      <div className="max-w-2xl">{editor(drink)}</div>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={drink.id}
                    data-drink-row={drink.id}
                    className="border-b border-rule hover:bg-hover"
                  >
                    <td className="py-2.5 pl-3 whitespace-nowrap text-text-2 tabular-nums">
                      {date(drink)}
                    </td>
                    <td className="py-2.5">
                      <span
                        className="flex min-w-0 items-center gap-2.5"
                        title={shopName(drink)}
                      >
                        <ShopAvatar
                          src={shopsById.get(drink.shopId)?.avatar ?? null}
                          name={shopName(drink)}
                          size={24}
                        />
                        <span className="truncate">{shopName(drink)}</span>
                      </span>
                    </td>
                    <td
                      className="truncate py-2.5"
                      title={drink.name ?? undefined}
                    >
                      {drink.name ?? ""}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap tabular-nums">
                      {price(drink)}
                    </td>
                    <td
                      className="truncate py-2.5 pl-8 text-text-2"
                      title={drink.note ?? undefined}
                    >
                      {drink.note ?? ""}
                    </td>
                    <td className="py-1 pr-3">{actions(drink)}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>

          <ul data-drink-list="drinks-heading" className="md:hidden">
            {shown.map((drink) => (
              <li
                key={drink.id}
                data-drink-row={drink.id}
                className="border-b border-rule py-3"
              >
                {editingId === drink.id ? (
                  <div className="py-2">{editor(drink)}</div>
                ) : (
                  <div className="flex items-center gap-3">
                    <ShopAvatar
                      src={shopsById.get(drink.shopId)?.avatar ?? null}
                      name={shopName(drink)}
                      size={30}
                    />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate text-text">
                        {shopName(drink)}
                        {drink.name && (
                          <span className="text-text-2"> · {drink.name}</span>
                        )}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-text-2">
                        {date(drink)}
                        {drink.note && ` · ${drink.note}`}
                      </p>
                    </div>
                    <span className="text-sm tabular-nums">{price(drink)}</span>
                    {actions(drink)}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {drinks.length > visible && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-xs text-text-2 tabular-nums">
                {t("showingOf", { shown: visible, total: drinks.length })}
              </p>
              <button
                type="button"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
                className="btn btn-quiet"
              >
                {t("showMore")}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
