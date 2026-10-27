"use client";

import { translateShopName } from "@/lib/default-shops";
import { failureCode } from "@/lib/network";
import type { ApiErrorResponse, BobaShop } from "@/lib/types";
import { useRef, useState } from "react";
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
  const { t: tc } = useTranslation("common");
  const [isDeleting, setIsDeleting] = useState(false);
  // Blocks a second press before the button re-renders as disabled.
  const busyRef = useRef(false);
  const name = shop ? translateShopName(shop.name, i18n.language) : "";

  async function handleConfirm() {
    if (!shop || busyRef.current) {
      return;
    }

    busyRef.current = true;
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
      onDeleted(shop.id);
      onClose();
    } catch {
      toast.error(t(failureCode("couldNotDeleteShop")));
    } finally {
      busyRef.current = false;
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
          {tc("cancel")}
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
