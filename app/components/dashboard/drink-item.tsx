"use client";

import { translateShopName } from "@/lib/default-shops";
import { formatMoney } from "@/lib/drinks";
import type { BobaShop, Drink } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import ShopAvatar from "./shop-avatar";

interface DrinkItemProps {
  drink: Drink;
  shop: BobaShop | undefined;
  currency: string;
  onEdit: () => void;
  /** Whether the keyboard pressed it, so focus can follow. */
  onRemove: (fromKeyboard: boolean) => void;
}

export default function DrinkItem({
  drink,
  shop,
  currency,
  onEdit,
  onRemove,
}: DrinkItemProps) {
  const { t, i18n } = useTranslation("dashboard");
  const shopName = shop ? translateShopName(shop.name, i18n.language) : "";

  return (
    <div className="flex items-center gap-3 py-3">
      <ShopAvatar src={shop?.avatar ?? null} name={shopName} size={30} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text">
          {shopName}
          {drink.name && <span className="text-text-2"> · {drink.name}</span>}
        </p>
        {drink.note && (
          <p className="mt-0.5 truncate text-xs text-text-2">{drink.note}</p>
        )}
      </div>
      {drink.priceCents !== null && (
        <span className="num text-sm text-text">
          {formatMoney(drink.priceCents, currency, i18n.language)}
        </span>
      )}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onEdit}
          className="tap-target relative grid size-10 place-items-center rounded-md text-text-3 hover:bg-hover hover:text-text sm:size-9"
          aria-label={t("editDrinkAria")}
        >
          <Pencil size={15} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          data-remove
          onClick={(event) => onRemove(event.detail === 0)}
          className="tap-target relative grid size-10 place-items-center rounded-md text-text-3 hover:bg-hover hover:text-danger sm:size-9"
          aria-label={t("removeDrinkAria")}
        >
          <Trash2 size={15} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
