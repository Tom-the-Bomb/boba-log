"use client";

import { translateShopName } from "@/lib/default-shops";
import { BobaShop } from "@/lib/types";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface ShopCardProps {
  shop: BobaShop;
  count: number;
  canUndo: boolean;
  undoCount?: number;
  isIncrementPending?: boolean;
  onAddDrink: (shopId: number) => void;
  onUndo: (shopId: number) => void;
  onDelete: (shopId: number) => void;
}

export default function ShopCard({
  shop,
  count,
  canUndo,
  undoCount = 0,
  isIncrementPending = false,
  onAddDrink,
  onUndo,
  onDelete,
}: ShopCardProps) {
  const { t, i18n } = useTranslation("dashboard");
  const translatedShopName = translateShopName(shop.name, i18n.language);

  return (
    <article
      className={`group relative w-full max-w-60 transition-opacity duration-150 ${
        isIncrementPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="transition-scale relative duration-200 group-hover:scale-[1.02]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(shop.id);
          }}
          className="tea-text-muted absolute -top-2 -right-2 z-10 rounded-full p-1 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500!"
          aria-label={t("deleteShopAria", { name: translatedShopName })}
        >
          <Trash2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => onAddDrink(shop.id)}
          disabled={isIncrementPending}
          className="w-full text-center"
          aria-label={t("addDrinkAria", { name: translatedShopName })}
        >
          <div className="flex flex-col items-center">
            <Image
              src={shop.avatar ?? "/default-shop-avatar.webp"}
              alt={translatedShopName}
              width={56}
              height={56}
              className="tea-ring-subtle h-14 w-14 rounded-full object-cover ring-1"
            />
            <h3 className="tea-text-primary mt-3 text-xs font-medium tracking-widest uppercase">
              {translatedShopName}
            </h3>
            <p className="tea-text-accent mt-2 font-display text-5xl font-medium tracking-tight">
              {count}
            </p>
          </div>
        </button>
      </div>
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => onUndo(shop.id)}
          disabled={!canUndo || isIncrementPending}
          className="tea-text-muted tea-hover-text-accent-enabled text-[10px] tracking-[0.15em] uppercase transition-colors disabled:pointer-events-none disabled:opacity-30"
        >
          {undoCount > 0 ? t("undoWithCount", { count: undoCount }) : t("undo")}
        </button>
      </div>
    </article>
  );
}
