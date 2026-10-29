"use client";

import { translateShopName } from "@/lib/default-shops";
import { failureCode, sendJson } from "@/lib/network";
import type { BobaShop } from "@/lib/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Modal } from "../ui/overlays";

interface DeleteShopDialogProps {
  shop: BobaShop | null;
  drinkCount: number;
  onClose: () => void;
  onDeleted: (shopId: number) => void;
}

export default function DeleteShopDialog({
  shop,
  drinkCount,
  onClose,
  onDeleted,
}: DeleteShopDialogProps) {
  const { t, i18n } = useTranslation("dashboard");
  const [isDeleting, setIsDeleting] = useState(false);
  const name = shop ? translateShopName(shop.name, i18n.language) : "";

  async function handleConfirm() {
    if (!shop) {
      return;
    }

    setIsDeleting(true);
    try {
      const { ok, data } = await sendJson(`/api/shops/${shop.id}`, "DELETE");
      if (!ok) {
        toast.error(t(data.code ?? "couldNotDeleteShop"));
        return;
      }
      onDeleted(shop.id);
      onClose();
    } catch {
      toast.error(t(failureCode("couldNotDeleteShop")));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal
      isOpen={shop !== null}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={t("deleteShopTitle", { name })}
      className="max-w-sm"
    >
      <p className="text-sm leading-relaxed text-text-2">
        {t("deleteShopBody", { count: drinkCount })}
      </p>
      <div className="mt-7 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="btn btn-quiet"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting}
          className="btn btn-danger"
        >
          {isDeleting ? t("deleting") : t("delete")}
        </button>
      </div>
    </Modal>
  );
}
