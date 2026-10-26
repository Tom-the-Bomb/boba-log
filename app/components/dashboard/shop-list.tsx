"use client";

import {
  countsByShop,
  drinksInRange,
  lastDayByShop,
} from "@/lib/dashboard-metrics";
import { translateShopName } from "@/lib/default-shops";
import type { BobaShop } from "@/lib/types";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDashboard } from "../../dashboard/dashboard-context";
import { useUser } from "../../providers/user-provider";
import AddShopDialog from "./add-shop-dialog";
import DeleteShopDialog from "./delete-shop-dialog";
import LoggedToast from "./logged-toast";
import ShopRow from "./shop-row";

export default function ShopList() {
  const { user, logDrink, removeDrink, addShop, removeShop } = useUser();
  const { today, range, setFocus } = useDashboard();
  const { t, i18n } = useTranslation("dashboard");
  const [isAdding, setIsAdding] = useState(false);
  const [deleting, setDeleting] = useState<BobaShop | null>(null);

  const shops = user?.shops ?? [];
  const drinks = useMemo(() => user?.drinks ?? [], [user?.drinks]);

  const { rangeCounts, todayCounts, lastDays, totalCounts, max } =
    useMemo(() => {
      const inRange = countsByShop(drinksInRange(drinks, range));
      return {
        rangeCounts: inRange,
        todayCounts: countsByShop(drinks.filter((d) => d.day === today)),
        lastDays: lastDayByShop(drinks),
        totalCounts: countsByShop(drinks),
        max: Math.max(1, ...inRange.values()),
      };
    }, [drinks, range, today]);

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
              const error = await removeDrink(result.id);
              if (error) {
                toast.error(t(error));
              }
            }
          }}
          onAddDetails={async () => {
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
