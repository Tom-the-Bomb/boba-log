import type { BobaShop } from "@/lib/types";
import ShopCard from "./shop-card";

interface DashboardShopsSectionProps {
  shops: BobaShop[];
  getShopCountForRange: (shop: BobaShop) => number;
  undoQueueMap: Record<string, number>;
  pendingIncrementMap: Record<string, boolean>;
  onAddDrink: (shopId: string) => void;
  onUndoDrink: (shopId: string) => void;
  onOpenAddModal: () => void;
}

export default function DashboardShopsSection({
  shops,
  getShopCountForRange,
  undoQueueMap,
  pendingIncrementMap,
  onAddDrink,
  onUndoDrink,
  onOpenAddModal,
}: DashboardShopsSectionProps) {
  return (
    <section className="mb-20">
      <p className="tea-text-accent mb-10 text-xs tracking-[0.3em] uppercase">
        Your shops
      </p>
      <div className="flex flex-wrap justify-center gap-10 lg:justify-start">
        {shops.map((shop) => (
          <ShopCard
            key={shop.id}
            shop={shop}
            count={getShopCountForRange(shop)}
            canUndo={(undoQueueMap[shop.id] ?? 0) > 0}
            undoCount={undoQueueMap[shop.id] ?? 0}
            isIncrementPending={Boolean(pendingIncrementMap[shop.id])}
            onAddDrink={onAddDrink}
            onUndo={onUndoDrink}
          />
        ))}

        <button
          type="button"
          onClick={onOpenAddModal}
          className="tea-border-accent-hover tea-border-subtle flex h-44 w-full max-w-60 items-center justify-center border border-dashed"
          aria-label="Add shop"
        >
          <span className="font-display tea-text-accent text-4xl font-medium opacity-80">
            +
          </span>
        </button>
      </div>
    </section>
  );
}
