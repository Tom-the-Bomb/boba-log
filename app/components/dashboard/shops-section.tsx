"use client";

import type { BobaShop } from "@/lib/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingShop, setDeletingShop] = useState<BobaShop | null>(null);

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
              startDate={startDate}
              endDate={endDate}
              onDelete={setDeletingShop}
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
        />
      )}

      <AddShopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
