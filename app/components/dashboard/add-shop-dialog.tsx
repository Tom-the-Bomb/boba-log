"use client";

import { findDefaultShop } from "@/lib/default-shops";
import { MAX_SHOP_NAME_LENGTH } from "@/lib/drinks";
import { failureCode } from "@/lib/network";
import { waitForToken } from "@/lib/turnstile";
import type { BobaShop, ShopMutationResponse } from "@/lib/types";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { Button, FileTrigger } from "react-aria-components";
import { useTranslation } from "react-i18next";
import useShopDraft from "../../hooks/use-shop-draft";
import InvisibleTurnstile from "../invisible-turnstile";
import { FormError } from "../ui/fields";
import { Modal } from "../ui/overlays";
import DefaultShopsSection from "./default-shops-section";

interface AddShopDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: (shop: BobaShop) => void;
}

export default function AddShopDialog({
  open,
  onClose,
  onAdded,
}: AddShopDialogProps) {
  const { t } = useTranslation("dashboard");
  const {
    shopName,
    setShopName,
    avatarFile,
    avatarPreview,
    handleAvatarFile,
    selectPreset,
    clearAvatar,
    resetDraft,
  } = useShopDraft();

  const turnstileRef = useRef<TurnstileInstance>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");

  function handleClose() {
    onClose();
    resetDraft();
    setError("");
    setNameError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedShopName = shopName.trim();
    if (!trimmedShopName) {
      setNameError(t("shopNameRequired"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = await waitForToken(turnstileRef);
      if (!token) {
        setError(t("couldNotAddShop"));
        return;
      }

      const formData = new FormData();
      formData.append("name", trimmedShopName);
      formData.append("turnstileToken", token);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch("/api/shops", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ShopMutationResponse;
      if (!response.ok || !data.shop) {
        setError(t(data.code ?? "couldNotAddShop"));
        return;
      }

      onAdded(data.shop);
      handleClose();
    } catch {
      setError(t(failureCode("couldNotAddShop")));
    } finally {
      setIsSubmitting(false);
      turnstileRef.current?.reset();
    }
  }

  return (
    <Modal
      isOpen={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      title={t("addShopTitle")}
    >
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <DefaultShopsSection
          onPresetSelect={(preset) => {
            selectPreset(preset);
            setNameError("");
            setError("");
          }}
        />

        <div>
          <label htmlFor="add-shop-name" className="label">
            {t("shopName")}
          </label>
          <input
            id="add-shop-name"
            value={shopName}
            maxLength={MAX_SHOP_NAME_LENGTH}
            autoComplete="off"
            onChange={(event) => {
              setShopName(event.target.value);
              const defaultShop = findDefaultShop(event.target.value);
              if (defaultShop) {
                selectPreset(defaultShop, false);
              }
              setNameError("");
            }}
            className="field"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "add-shop-name-error" : undefined}
          />
          <FormError
            id="add-shop-name-error"
            message={nameError}
            className="mt-2"
          />
        </div>

        <div>
          <span id="add-shop-avatar-label" className="label">
            {t("avatarImage")}
          </span>
          <div className="flex items-center gap-3">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt={t("avatarPreviewAlt")}
                width={44}
                height={44}
                unoptimized
                className="size-11 rounded-full object-cover ring-1 ring-rule"
              />
            ) : (
              <span
                aria-hidden="true"
                className="size-11 shrink-0 rounded-full bg-glaze-0 ring-1 ring-rule ring-inset"
              />
            )}
            <FileTrigger
              acceptedFileTypes={["image/*"]}
              onSelect={async (files) => {
                const errorKey = await handleAvatarFile(files?.[0]);
                setError(errorKey ? t(errorKey) : "");
              }}
            >
              <Button
                id="add-shop-avatar-choose"
                aria-labelledby="add-shop-avatar-label add-shop-avatar-choose"
                className="btn btn-quiet h-9 px-3"
              >
                <ImagePlus size={15} strokeWidth={1.5} />
                {t("chooseFile")}
              </Button>
            </FileTrigger>
            {avatarFile ? (
              <button
                type="button"
                onClick={clearAvatar}
                className="icon-btn size-9 hover:text-danger"
                aria-label={t("removeAvatar")}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            ) : (
              <span className="text-sm text-text-3">{t("noFileChosen")}</span>
            )}
          </div>
        </div>

        <InvisibleTurnstile ref={turnstileRef} />

        <FormError message={error} />

        <div className="flex items-center justify-end gap-3 border-t border-rule pt-5">
          <button type="button" onClick={handleClose} className="btn btn-quiet">
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? t("adding") : t("addShop")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
