"use client";

import type { DefaultShopPresetOption } from "@/lib/default-shops";
import Image from "next/image";
import type { ChangeEvent, FormEvent } from "react";
import DefaultShopsSection from "./default-shops-section";

interface AddShopModalProps {
  isOpen: boolean;
  shopName: string;
  avatar: string;
  presets: readonly DefaultShopPresetOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPresetSelect: (preset: DefaultShopPresetOption) => void;
  onShopNameChange: (value: string) => void;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function AddShopModal({
  isOpen,
  shopName,
  avatar,
  presets,
  isSubmitting,
  onClose,
  onSubmit,
  onPresetSelect,
  onShopNameChange,
  onAvatarChange,
}: AddShopModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px] dark:bg-black/60"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="tea-surface tea-border-subtle relative z-10 w-full max-w-md border px-10 py-10">
        <h3 className="font-display tea-text-primary text-2xl font-medium tracking-tight">
          Add shop
        </h3>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <DefaultShopsSection
            presets={presets}
            onPresetSelect={onPresetSelect}
          />

          <div>
            <label
              htmlFor="modal-shop-name"
              className="tea-text-muted mb-1.5 block text-[10px] tracking-[0.2em] uppercase"
            >
              Shop name
            </label>
            <input
              id="modal-shop-name"
              value={shopName}
              onChange={(event) => onShopNameChange(event.target.value)}
              className="tea-text-primary tea-border-accent-focus tea-border-subtle w-full border-b bg-transparent py-2.5 text-sm outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="modal-avatar"
              className="tea-text-muted mb-1.5 block text-[10px] tracking-[0.2em] uppercase"
            >
              Avatar image
            </label>
            <input
              id="modal-avatar"
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="tea-text-muted file:tea-surface-muted file:tea-text-primary w-full text-sm file:mr-4 file:border-0 file:py-2 file:text-xs file:tracking-wider file:uppercase"
            />
          </div>

          {avatar ? (
            <div className="pt-2">
              <p className="tea-text-muted mb-2 text-[10px] tracking-[0.2em] uppercase">
                Preview
              </p>
              <Image
                src={avatar}
                alt="Avatar preview"
                width={64}
                height={64}
                className="tea-ring-subtle h-16 w-16 rounded-full object-cover ring-1"
                unoptimized
              />
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-5 pt-6">
            <button type="button" onClick={onClose} className="tea-link">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !avatar}
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
