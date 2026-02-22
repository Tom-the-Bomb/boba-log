"use client";

import { findDefaultShop } from "@/lib/default-shops";
import { waitForToken } from "@/lib/turnstile";
import { BobaShop, ShopMutationResponse } from "@/lib/types";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useShopDraft from "../../hooks/use-shop-draft";
import { useUser } from "../../providers/user-provider";
import DefaultShopsSection from "./default-shops-section";

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddShopModal({ isOpen, onClose }: AddShopModalProps) {
  const { user, setUserShops } = useUser();
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
  const [turnstileToken, setTurnstileToken] = useState("");

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    onClose();
    resetDraft();
    setError("");
    setNameError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!user) {
      return;
    }
    event.preventDefault();
    const trimmedShopName = shopName.trim();
    if (!trimmedShopName) {
      setNameError(t("shopNameRequired"));
      return;
    }

    if (trimmedShopName.length > 100) {
      setNameError(t("shopNameTooLong"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", trimmedShopName);
      const token = await waitForToken(turnstileRef, turnstileToken);
      if (!token) {
        setError(t("couldNotAddShop"));
        turnstileRef.current?.reset();
        setIsSubmitting(false);
        return;
      }
      formData.append("turnstileToken", token);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch("/api/shops", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ShopMutationResponse;
      if (!response.ok) {
        setError(t(data.code ?? "couldNotAddShop"));
        setTurnstileToken("");
        turnstileRef.current?.reset();
        return;
      }

      setUserShops((current) => [...current, data.shop as BobaShop]);
      handleClose();
    } catch {
      setError(t("couldNotAddShop"));
    } finally {
      setIsSubmitting(false);
      setTurnstileToken("");
      turnstileRef.current?.reset();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="modal-bg"
        onClick={handleClose}
        aria-label={tc("closeModal")}
      />

      <div className="relative z-10 mx-3 max-h-[90vh] w-full max-w-md overflow-y-auto border border-tea-stone bg-tea-white px-10 py-10 md:mx-0">
        <h3 className="font-display text-2xl font-medium tracking-tight text-tea-charcoal">
          {t("addShopLabel")}
        </h3>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <DefaultShopsSection
            onPresetSelect={(preset) => {
              selectPreset(preset);
              setError("");
            }}
          />

          <div>
            <label htmlFor="modal-shop-name" className="tea-form-label">
              {t("shopName")}
            </label>
            <input
              id="modal-shop-name"
              value={shopName}
              onChange={(event) => {
                setShopName(event.target.value);
                const defaultShop = findDefaultShop(event.target.value);
                if (defaultShop) {
                  selectPreset(defaultShop, false);
                }
                if (nameError) {
                  setNameError("");
                }
              }}
              className={`tea-input-line ${nameError ? "tea-input-error" : ""}`}
              aria-describedby={nameError ? "modal-shop-name-error" : undefined}
            />
            {nameError && (
              <p
                id="modal-shop-name-error"
                className="tea-form-error"
                role="alert"
              >
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="modal-avatar" className="tea-form-label">
              {t("avatarImage")}
            </label>
            <input
              ref={fileInputRef}
              id="modal-avatar"
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const errorKey = await handleAvatarInputChange(event);
                setError(errorKey ? t(errorKey) : "");
              }}
              className="hidden"
            />
            <div className="flex w-full items-center text-sm">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mr-4 bg-transparent py-2 text-xs tracking-wider text-tea-faint uppercase"
              >
                {t("chooseFile")}
              </button>
              <span className="truncate text-tea-faint">
                {avatarFile ? avatarFile.name : t("noFileChosen")}
              </span>
              {avatarFile && (
                <button
                  type="button"
                  onClick={clearAvatar}
                  className="ml-2 shrink-0 text-tea-faint hover:text-red-500"
                  aria-label={t("removeAvatar")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {avatarPreview && (
            <div className="pt-2">
              <p className="tea-caps-10 mb-2 text-tea-faint">{t("preview")}</p>
              <Image
                src={avatarPreview}
                alt={t("avatarPreviewAlt")}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover ring-1 ring-tea-stone"
              />
            </div>
          )}

          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={setTurnstileToken}
            onError={() => setTurnstileToken("")}
            onExpire={() => setTurnstileToken("")}
            options={{ size: "invisible" }}
            className="-mt-6"
          />

          {error && <p className="tea-form-error pt-2 text-center">{error}</p>}

          <div className="flex items-center justify-end gap-5 pt-6">
            <button type="button" onClick={handleClose} className="tea-link">
              {tc("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="tea-cta px-6 py-3 text-xs tracking-[0.15em] uppercase disabled:opacity-40"
            >
              {isSubmitting ? t("adding") : t("addShopLabel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
