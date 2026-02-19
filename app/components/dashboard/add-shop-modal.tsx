"use client";

import { findDefaultShop } from "@/lib/default-shops";
import { BobaShop } from "@/lib/types";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useShopDraft from "../../hooks/use-shop-draft";
import { useTheme } from "../../providers/theme-provider";
import { useUser } from "../../providers/user-provider";
import DefaultShopsSection from "./default-shops-section";

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddShopModal({ isOpen, onClose }: AddShopModalProps) {
  const { user, setUserShops } = useUser();
  const { isDark } = useTheme();
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
      formData.append("turnstileToken", turnstileToken);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch("/api/shops", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = (await response.json()) as {
        code?: string;
        shop?: BobaShop;
      };
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
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px] dark:bg-black/60"
        onClick={handleClose}
        aria-label={tc("closeModal")}
      />

      <div className="tea-surface tea-border-subtle relative z-10 w-full max-w-md border px-10 py-10">
        <h3 className="tea-text-primary font-display text-2xl font-medium tracking-tight">
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
            <label
              htmlFor="modal-shop-name"
              className="tea-text-muted tea-form-label"
            >
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
              className={`tea-text-primary tea-border-accent-focus tea-border-subtle tea-input-line transition-colors ${
                nameError ? "tea-input-error" : ""
              }`}
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
            <label
              htmlFor="modal-avatar"
              className="tea-text-muted tea-form-label"
            >
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
                className="tea-text-muted mr-4 bg-transparent py-2 text-xs tracking-wider uppercase"
              >
                {t("chooseFile")}
              </button>
              <span className="tea-text-muted truncate">
                {avatarFile ? avatarFile.name : t("noFileChosen")}
              </span>
              {avatarFile && (
                <button
                  type="button"
                  onClick={clearAvatar}
                  className="tea-text-muted ml-2 shrink-0 hover:text-red-500"
                  aria-label={t("removeAvatar")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {avatarPreview && (
            <div className="pt-2">
              <p className="tea-text-muted tea-caps-10 mb-2">{t("preview")}</p>
              <Image
                src={avatarPreview}
                alt={t("avatarPreviewAlt")}
                width={64}
                height={64}
                className="tea-ring-subtle h-16 w-16 rounded-full object-cover ring-1"
              />
            </div>
          )}

          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={setTurnstileToken}
              onError={() => setTurnstileToken("")}
              onExpire={() => setTurnstileToken("")}
              options={{ theme: isDark ? "dark" : "light", size: "normal" }}
            />
          </div>

          {error && <p className="tea-form-error pt-2 text-center">{error}</p>}

          <div className="flex items-center justify-end gap-5 pt-6">
            <button type="button" onClick={handleClose} className="tea-link">
              {tc("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !turnstileToken}
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
