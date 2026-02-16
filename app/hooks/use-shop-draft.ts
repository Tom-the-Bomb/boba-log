"use client";

import type { DefaultShopPresetOption } from "@/lib/default-shops";
import { resizeImageToWebP } from "@/lib/resize-image";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

function isImageMimeType(mimeType: string) {
  return mimeType.toLowerCase().startsWith("image/");
}

function getAvatarProcessingErrorMessage(error: unknown) {
  if (error instanceof DOMException || error instanceof TypeError) {
    return "This image format or codec isn't supported by your browser. Try another image file.";
  }

  return "Could not process image.";
}

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
    if (!file) {
      return null;
    }

    if (file.type && !isImageMimeType(file.type)) {
      return "Invalid avatar format. Please upload an image file.";
    }

    try {
      const resized = await resizeImageToWebP(file);
      revokeObjectUrlIfNeeded(avatarPreview);
      const nextPreview = URL.createObjectURL(resized);
      setAvatarFile(resized);
      setAvatarPreview(nextPreview);
      return null;
    } catch (error) {
      return getAvatarProcessingErrorMessage(error);
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
