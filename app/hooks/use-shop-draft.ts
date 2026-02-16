"use client";

import type { DefaultShopPresetOption } from "@/lib/default-shops";
import { resizeImageToWebP } from "@/lib/resize-image";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function revokeObjectUrlIfNeeded(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export default function useShopDraft() {
  const [shopName, setShopName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    return () => {
      revokeObjectUrlIfNeeded(avatarPreview);
    };
  }, [avatarPreview]);

  async function handleAvatarInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<string | null> {
    const file = event.target.files?.[0];
    if (!file) return null;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return "Invalid avatar format. Use JPEG, PNG, or WebP.";
    }

    try {
      const resized = await resizeImageToWebP(file);
      revokeObjectUrlIfNeeded(avatarPreview);
      const nextPreview = URL.createObjectURL(resized);
      setAvatarFile(resized);
      setAvatarPreview(nextPreview);
      return null;
    } catch {
      return "Could not process image.";
    }
  }

  function selectPreset(preset: DefaultShopPresetOption) {
    revokeObjectUrlIfNeeded(avatarPreview);
    setShopName(preset.name);
    setAvatarFile(null);
    setAvatarPreview(preset.avatar);
  }

  function resetDraft() {
    revokeObjectUrlIfNeeded(avatarPreview);
    setShopName("");
    setAvatarFile(null);
    setAvatarPreview("");
  }

  return {
    shopName,
    setShopName,
    avatarFile,
    avatarPreview,
    handleAvatarInputChange,
    selectPreset,
    resetDraft,
  };
}
