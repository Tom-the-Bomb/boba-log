"use client";

import { translateShopName } from "@/lib/default-shops";
import { formatMoney } from "@/lib/drinks";
import type { BobaShop, Drink } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import ShopAvatar from "./shop-avatar";

interface DrinkActionsProps {
  drink: Drink;
  onEdit: () => void;
  onRemove: (fromKeyboard: boolean) => void;
}

export function DrinkActions({ drink, onEdit, onRemove }: DrinkActionsProps) {
  const { t } = useTranslation("dashboard");
  const saving = drink.id < 0;

  return (
    <div className="flex shrink-0 justify-end">
      <button
        type="button"
        disabled={saving}
        onClick={onEdit}
        className="icon-btn size-10 text-text-3 sm:size-9"
        aria-label={t("editDrinkAria")}
      >
        <Pencil size={15} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        data-remove
        disabled={saving}
        onClick={(event) => onRemove(event.detail === 0)}
        className="icon-btn size-10 text-text-3 hover:text-danger sm:size-9"
        aria-label={t("removeDrinkAria")}
      >
        <Trash2 size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
}

interface DrinkItemProps extends DrinkActionsProps {
  shop: BobaShop | undefined;
  currency: string;
}

export default function DrinkItem({
  drink,
  shop,
  currency,
  onEdit,
  onRemove,
}: DrinkItemProps) {
  const { i18n } = useTranslation("dashboard");
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
        <span className="text-sm text-text tabular-nums">
          {formatMoney(drink.priceCents, currency, i18n.language)}
        </span>
      )}
      <DrinkActions drink={drink} onEdit={onEdit} onRemove={onRemove} />
    </div>
  );
}
