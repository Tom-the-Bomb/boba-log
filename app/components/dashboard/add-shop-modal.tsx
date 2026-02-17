"use client";

import { DEFAULT_SHOPS } from "@/lib/default-shops";
import { BobaShop } from "@/lib/types";
import Image from "next/image";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import useShopDraft from "../../hooks/use-shop-draft";
import { useUser } from "../../providers/user-provider";
import DefaultShopsSection from "./default-shops-section";

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShopAdded: (shop: BobaShop) => void;
}

export default function AddShopModal({
  isOpen,
  onClose,
  onShopAdded,
}: AddShopModalProps) {
  const { user } = useUser();
  const {
    shopName,
    setShopName,
    avatarFile,
    avatarPreview,
    handleAvatarInputChange,
    selectPreset,
    resetDraft,
  } = useShopDraft();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    onClose();
    setError("");
    setNameError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!user) {
      return;
    }
    event.preventDefault();
    const trimmedShopName = shopName.trim();
    if (!trimmedShopName) {
      setNameError("Shop name is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", trimmedShopName);
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
        error?: string;
        shop?: BobaShop;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not create shop.");
      }

      onShopAdded(data.shop as BobaShop);
      onClose();
      resetDraft();
      setError("");
      setNameError("");
    } catch {
      setError("Could not add boba shop.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const avatarError = await handleAvatarInputChange(event);
    setError(avatarError ?? "");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px] dark:bg-black/60"
        onClick={handleClose}
        aria-label="Close modal"
      />

      <div className="tea-surface tea-border-subtle relative z-10 w-full max-w-md border px-10 py-10">
        <h3 className="tea-text-primary font-display text-2xl font-medium tracking-tight">
          Add shop
        </h3>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <DefaultShopsSection
            presets={DEFAULT_SHOPS}
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
              Shop name
            </label>
            <input
              id="modal-shop-name"
              value={shopName}
              onChange={(event) => {
                setShopName(event.target.value);
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
              Avatar image
            </label>
            <input
              id="modal-avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="tea-text-muted file:tea-surface-muted file:tea-text-primary w-full text-sm file:mr-4 file:border-0 file:py-2 file:text-xs file:tracking-wider file:uppercase"
            />
          </div>

          {avatarPreview && (
            <div className="pt-2">
              <p className="tea-text-muted tea-caps-10 mb-2">Preview</p>
              <Image
                src={avatarPreview}
                alt="Avatar preview"
                width={64}
                height={64}
                className="tea-ring-subtle h-16 w-16 rounded-full object-cover ring-1"
                unoptimized
              />
            </div>
          )}

          {error && <p className="tea-form-error pt-2 text-center">{error}</p>}

          <div className="flex items-center justify-end gap-5 pt-6">
            <button type="button" onClick={handleClose} className="tea-link">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="tea-cta px-6 py-3 text-xs tracking-[0.15em] uppercase disabled:opacity-40"
            >
              {isSubmitting ? "Adding..." : "Add shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
