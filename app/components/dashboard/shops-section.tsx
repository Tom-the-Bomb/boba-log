"use client";

import { getShopCountForRange } from "@/lib/dashboard-metrics";
import type { BobaShop } from "@/lib/types";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useUser } from "../../providers/user-provider";
import AddShopModal from "./add-shop-modal";
import ConfirmDeleteModal from "./confirm-delete-modal";
import ShopCard from "./shop-card";

interface ShopsSectionProps {
  shops: readonly BobaShop[];
  startDate: string;
  endDate: string;
}

export default function ShopsSection({
  shops,
  startDate,
  endDate,
}: ShopsSectionProps) {
  const { user, setUserShops } = useUser();
  const { t } = useTranslation("dashboard");

  const [undoQueueMap, setUndoQueueMap] = useState<Record<string, number>>({});
  const [pendingIncrementMap, setPendingIncrementMap] = useState<
    Record<string, boolean>
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingShop, setDeletingShop] = useState<BobaShop | null>(null);

  const requestShopUpdate = useCallback(
    async (shopId: number, path: "increment" | "undo") => {
      const response = await fetch(`/api/shops/${shopId}/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = (await response.json()) as {
        code?: string;
        shop?: BobaShop;
      };

      if (response.ok && data.shop) {
        setUserShops((current) =>
          current.map((shop) =>
            shop.id === data.shop!.id ? data.shop! : shop,
          ),
        );
      }

      return data;
    },
    [setUserShops, user?.token],
  );

  async function addDrink(shopId: number) {
    if (!user || pendingIncrementMap[shopId]) {
      return;
    }

    setPendingIncrementMap((current) => ({ ...current, [shopId]: true }));

    try {
      const { shop, code } = await requestShopUpdate(shopId, "increment");
      if (shop) {
        setUndoQueueMap((current) => ({
          ...current,
          [shopId]: (current[shopId] ?? 0) + 1,
        }));
      } else {
        toast.error(t(code ?? "couldNotIncrement"));
      }
    } catch {
      toast.error(t("couldNotIncrement"));
    } finally {
      setPendingIncrementMap((current) => ({ ...current, [shopId]: false }));
    }
  }

  async function undoDrink(shopId: number) {
    if (!user || (undoQueueMap[shopId] ?? 0) <= 0) {
      return;
    }

    try {
      const { shop, code } = await requestShopUpdate(shopId, "undo");
      if (shop) {
        setUndoQueueMap((current) => ({
          ...current,
          [shopId]: Math.max((current[shopId] ?? 0) - 1, 0),
        }));
      } else {
        toast.error(t(code ?? "couldNotUndo"));
      }
    } catch {
      toast.error(t("couldNotUndo"));
    }
  }

  function requestDeleteShop(shopId: number) {
    const shop = shops.find((s) => s.id === shopId);
    if (shop) {
      setDeletingShop(shop);
    }
  }

  return (
    <>
      <section className="mb-20">
        <p className="tea-text-accent mb-10 text-xs tracking-[0.3em] uppercase">
          {t("yourShops")}
        </p>
        <div className="flex flex-wrap justify-center gap-10 lg:justify-start">
          {shops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              count={getShopCountForRange(shop, startDate, endDate)}
              undoCount={undoQueueMap[shop.id] ?? 0}
              isIncrementPending={Boolean(pendingIncrementMap[shop.id])}
              onAddDrink={addDrink}
              onUndo={undoDrink}
              onDelete={requestDeleteShop}
            />
          ))}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="tea-border-accent-hover tea-border-subtle flex h-44 w-full max-w-60 items-center justify-center border border-dashed"
            aria-label={t("addShopLabel")}
          >
            <span className="tea-text-accent font-display text-4xl font-medium opacity-80">
              +
            </span>
          </button>
        </div>
      </section>

      {deletingShop && (
        <ConfirmDeleteModal
          shop={deletingShop}
          onClose={() => setDeletingShop(null)}
          onDeleted={(shopId) => {
            setUserShops((current) =>
              current.filter((shop) => shop.id !== shopId),
            );
          }}
        />
      )}

      <AddShopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShopAdded={(shop) => {
          setUserShops((current) => [...current, shop]);
        }}
      />
    </>
  );
}
