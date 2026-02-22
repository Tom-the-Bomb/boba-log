"use client";

import { translateShopName } from "@/lib/default-shops";
import type { ApiErrorResponse, BobaShop } from "@/lib/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useUser } from "../../providers/user-provider";

interface ConfirmDeleteModalProps {
  shop: BobaShop;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  shop,
  onClose,
}: ConfirmDeleteModalProps) {
  const { user, setUserShops } = useUser();
  const { t, i18n } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!user) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/shops/${shop.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as ApiErrorResponse;
      if (!response.ok) {
        toast.error(t(data.code ?? "couldNotDeleteShop"));
        return;
      }

      setUserShops((current) => current.filter((s) => s.id !== shop.id));
      onClose();
    } catch {
      toast.error(t("couldNotDeleteShop"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="modal-bg"
        onClick={onClose}
        aria-label={tc("closeModal")}
      />

      <div className="relative z-10 w-full max-w-sm border border-tea-stone bg-tea-white px-10 py-10">
        <h3 className="font-display text-2xl font-medium tracking-tight text-tea-charcoal">
          {t("deleteShopTitle")}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-tea-faint">
          {t("deleteConfirmBefore")}
          <span className="font-medium text-tea-charcoal">
            {translateShopName(shop.name, i18n.language)}
          </span>
          {t("deleteConfirmAfter")}
        </p>

        <div className="flex items-center justify-end gap-5 pt-8">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="tea-link"
          >
            {tc("cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 px-6 py-3 text-xs tracking-[0.15em] text-white uppercase transition-colors hover:bg-red-700 disabled:opacity-40"
          >
            {isDeleting ? t("deleting") : t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
