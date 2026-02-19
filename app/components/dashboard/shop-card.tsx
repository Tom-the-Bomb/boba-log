"use client";

import { getShopCountForRange } from "@/lib/dashboard-metrics";
import { translateShopName } from "@/lib/default-shops";
import type { BobaShop, ShopMutationResponse } from "@/lib/types";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useUser } from "../../providers/user-provider";

interface ShopCardProps {
  shop: BobaShop;
  startDate: string;
  endDate: string;
  onDelete: (shop: BobaShop) => void;
}

export default function ShopCard({
  shop,
  startDate,
  endDate,
  onDelete,
}: ShopCardProps) {
  const { user, setUserShops } = useUser();
  const { t, i18n } = useTranslation("dashboard");
  const translatedShopName = translateShopName(shop.name, i18n.language);
  const count = getShopCountForRange(shop, startDate, endDate);

  const [undoCount, setUndoCount] = useState(0);
  const [isPending, setIsPending] = useState(false);

  async function requestShopUpdate(path: "increment" | "undo") {
    const response = await fetch(`/api/shops/${shop.id}/${path}`, {
      method: "POST",
    });
    const data = (await response.json()) as ShopMutationResponse;

    if (response.ok && data.shop) {
      setUserShops((current) =>
        current.map((s) => (s.id === data.shop!.id ? data.shop! : s)),
      );
    }

    return data;
  }

  async function addDrink() {
    if (!user || isPending) {
      return;
    }

    setIsPending(true);
    try {
      const { shop: updated, code } = await requestShopUpdate("increment");
      if (updated) {
        setUndoCount((c) => c + 1);
      } else {
        toast.error(t(code ?? "couldNotIncrement"));
      }
    } catch {
      toast.error(t("couldNotIncrement"));
    } finally {
      setIsPending(false);
    }
  }

  async function undoDrink() {
    if (!user || undoCount <= 0) {
      return;
    }

    try {
      const { shop: updated, code } = await requestShopUpdate("undo");
      if (updated) {
        setUndoCount((c) => Math.max(c - 1, 0));
      } else {
        toast.error(t(code ?? "couldNotUndo"));
      }
    } catch {
      toast.error(t("couldNotUndo"));
    }
  }

  return (
    <article
      className={`group relative w-full max-w-60 transition-opacity duration-150 ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="transition-scale relative duration-200 group-hover:scale-[1.02]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(shop);
          }}
          className="tea-text-muted absolute -top-2 -right-2 z-10 rounded-full p-1 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500!"
          aria-label={t("deleteShopAria", { name: translatedShopName })}
        >
          <Trash2 size={14} />
        </button>
        <button
          type="button"
          onClick={addDrink}
          disabled={isPending}
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
              unoptimized
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
          onClick={undoDrink}
          disabled={undoCount <= 0 || isPending}
          className="tea-text-muted tea-hover-text-accent-enabled text-[10px] tracking-[0.15em] uppercase transition-colors disabled:pointer-events-none disabled:opacity-30"
        >
          {undoCount > 0 ? t("undoWithCount", { count: undoCount }) : t("undo")}
        </button>
      </div>
    </article>
  );
}
