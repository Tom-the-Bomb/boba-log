"use client";

import { findDefaultShop } from "@/lib/default-shops";
import { MAX_SHOP_NAME_LENGTH } from "@/lib/drinks";
import { failureCode } from "@/lib/network";
import { waitForToken } from "@/lib/turnstile";
import type { BobaShop, ShopMutationResponse } from "@/lib/types";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useShopDraft from "../../hooks/use-shop-draft";
import InvisibleTurnstile from "../invisible-turnstile";
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
  const { t: tc } = useTranslation("common");
  const {
    shopName,
    setShopName,
    avatarFile,
    avatarPreview,
    handleAvatarInputChange,
    selectPreset,
    clearAvatar,
    resetDraft,
  } = useShopDraft();

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedShopName = shopName.trim();
    if (!trimmedShopName) {
      setNameError(t("shopNameRequired"));
      return;
    }

    if (trimmedShopName.length > MAX_SHOP_NAME_LENGTH) {
      setNameError(t("shopNameTooLong"));
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
          {nameError && (
            <p id="add-shop-name-error" className="mt-2 text-sm text-danger">
              {nameError}
            </p>
          )}
        </div>

        <div>
          <span id="add-shop-avatar-label" className="label">
            {t("avatarImage")}
          </span>
          <input
            ref={fileInputRef}
            id="add-shop-avatar"
            aria-hidden="true"
            type="file"
            accept="image/*"
            onChange={async (event) => {
              const errorKey = await handleAvatarInputChange(event);
              setError(errorKey ? t(errorKey) : "");
            }}
            className="sr-only"
            tabIndex={-1}
          />
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
                className="size-11 rounded-full bg-glaze-0 ring-1 ring-rule ring-inset"
              />
            )}
            <button
              type="button"
              id="add-shop-avatar-choose"
              aria-labelledby="add-shop-avatar-label add-shop-avatar-choose"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-quiet h-9 px-3"
            >
              <ImagePlus size={15} strokeWidth={1.5} />
              {t("chooseFile")}
            </button>
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

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-rule pt-5">
          <button type="button" onClick={handleClose} className="btn btn-quiet">
            {tc("cancel")}
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
