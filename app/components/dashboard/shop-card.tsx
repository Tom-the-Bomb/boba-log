import { BobaShop } from "@/lib/types";
import Image from "next/image";

interface ShopCardProps {
  shop: BobaShop;
  count: number;
  canUndo: boolean;
  undoCount?: number;
  isIncrementPending?: boolean;
  onAddDrink: (shopId: number) => void;
  onUndo: (shopId: number) => void;
}

export default function ShopCard({
  shop,
  count,
  canUndo,
  undoCount = 0,
  isIncrementPending = false,
  onAddDrink,
  onUndo,
}: ShopCardProps) {
  return (
    <article
      className={`group w-full max-w-60 transition-opacity duration-150 ${
        isIncrementPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={() => onAddDrink(shop.id)}
        disabled={isIncrementPending}
        className="w-full text-center transition-transform duration-200 hover:scale-[1.02]"
        aria-label={`Add drink for ${shop.name}`}
      >
        <div className="flex flex-col items-center">
          <Image
            src={shop.avatar}
            alt={shop.name}
            width={56}
            height={56}
            className="tea-ring-subtle h-14 w-14 rounded-full object-cover ring-1"
            unoptimized
          />
          <h3 className="tea-text-primary mt-3 text-xs font-medium tracking-widest uppercase">
            {shop.name}
          </h3>
          <p className="font-display tea-text-accent mt-2 text-5xl font-medium tracking-tight">
            {count}
          </p>
        </div>
      </button>
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => onUndo(shop.id)}
          disabled={!canUndo || isIncrementPending}
          className="tea-text-muted tea-hover-text-accent-enabled text-[10px] tracking-[0.15em] uppercase transition-colors disabled:pointer-events-none disabled:opacity-30"
        >
          {undoCount > 0 ? `Undo (${undoCount})` : "Undo"}
        </button>
      </div>
    </article>
  );
}
