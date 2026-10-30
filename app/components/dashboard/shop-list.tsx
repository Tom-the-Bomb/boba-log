"use client";

import { countsByShop, lastDayByShop } from "@/lib/dashboard-metrics";
import { translateShopName } from "@/lib/default-shops";
import type { BobaShop, Drink } from "@/lib/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDashboard } from "../../dashboard/dashboard-context";
import { useUser } from "../../providers/user-provider";
import AddShopDialog from "./add-shop-dialog";
import DeleteShopDialog from "./delete-shop-dialog";
import LoggedToast from "./logged-toast";
import ShopRow from "./shop-row";

export default function ShopList({ inRange }: { inRange: readonly Drink[] }) {
  const { user, logDrink, removeDrink, addShop, removeShop } = useUser();
  const { today, setFocus } = useDashboard();
  const { t, i18n } = useTranslation("dashboard");
  const [isAdding, setIsAdding] = useState(false);
  const [deleting, setDeleting] = useState<BobaShop | null>(null);

  const shops = user?.shops ?? [];
  const drinks = user?.drinks ?? [];
  const rangeCounts = countsByShop(inRange);
  const todayCounts = countsByShop(drinks.filter((d) => d.day === today));
  const lastDays = lastDayByShop(drinks);
  const totalCounts = countsByShop(drinks);
  const max = Math.max(1, ...rangeCounts.values());

  async function handleLog(shop: BobaShop) {
    const name = translateShopName(shop.name, i18n.language);
    const pending = logDrink(shop.id, { day: today });

    const toastId = toast.custom(
      (id) => (
        <LoggedToast
          shopName={name}
          onUndo={async () => {
            toast.dismiss(id);
            const result = await pending;
            if (typeof result !== "string") {
              const error = await removeDrink(result);
              if (error) {
                toast.error(t(error));
              }
            }
          }}
          onAddDetails={async () => {
            // Sonner refocuses +1 when focus leaves the toast; let it before the panel takes focus.
            (document.activeElement as HTMLElement | null)?.blur();
            toast.dismiss(id);
            const result = await pending;
            if (typeof result !== "string") {
              setFocus({ day: result.day, drinkId: result.id });
            }
          }}
        />
      ),
      { duration: 6000 },
    );

    const result = await pending;
    if (typeof result === "string") {
      toast.dismiss(toastId);
      toast.error(t(result));
    }
  }

  return (
    <section aria-labelledby="shops-heading">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
        <h2 id="shops-heading" className="font-kai text-xl text-text">
          {t("shops")}
        </h2>
        {shops.length > 0 && (
          <p className="text-xs text-text-2">{t("shopsHint")}</p>
        )}
      </div>

      {shops.length === 0 ? (
        <div className="border-b border-rule py-8">
          <p className="font-kai text-lg text-text">{t("noShopsTitle")}</p>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-text-2">
            {t("noShopsBody")}
          </p>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="btn btn-primary mt-5"
          >
            <Plus size={16} strokeWidth={1.5} />
            {t("addShop")}
          </button>
        </div>
      ) : (
        <>
          <ul>
            {shops.map((shop) => (
              <ShopRow
                key={shop.id}
                shop={shop}
                count={rangeCounts.get(shop.id) ?? 0}
                todayCount={todayCounts.get(shop.id) ?? 0}
                lastDay={lastDays.get(shop.id) ?? null}
                share={(rangeCounts.get(shop.id) ?? 0) / max}
                onLog={() => void handleLog(shop)}
                onLogWithDetails={() => {
                  setFocus({ day: today, shopId: shop.id });
                }}
                onDelete={() => setDeleting(shop)}
              />
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mt-2 flex h-11 items-center gap-2 rounded-md text-sm text-text-2 hover:text-text"
          >
            <Plus size={16} strokeWidth={1.5} />
            {t("addShop")}
          </button>
        </>
      )}

      <AddShopDialog
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onAdded={addShop}
      />
      <DeleteShopDialog
        shop={deleting}
        drinkCount={deleting ? (totalCounts.get(deleting.id) ?? 0) : 0}
        onClose={() => setDeleting(null)}
        onDeleted={removeShop}
      />
    </section>
  );
}
