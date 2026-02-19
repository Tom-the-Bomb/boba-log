"use client";

import type { DefaultShopPresetOption } from "@/lib/default-shops";
import { resizeImageToWebP } from "@/lib/resize-image";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

function isImageMimeType(mimeType: string) {
  return mimeType.toLowerCase().startsWith("image/");
}

function getAvatarProcessingErrorKey(error: unknown) {
  if (error instanceof DOMException || error instanceof TypeError) {
    return "unsupportedImageFormat";
  }

  return "couldNotProcessImage";
}

function revokeObjectUrlIfNeeded(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export default function useShopDraft() {
  const { i18n } = useTranslation();
  const [shopName, setShopName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const presetAbortRef = useRef<AbortController | null>(null);

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
      return "invalidAvatarFormat";
    }

    presetAbortRef.current?.abort();
    presetAbortRef.current = null;

    try {
      const resized = await resizeImageToWebP(file);
      revokeObjectUrlIfNeeded(avatarPreview);
      const nextPreview = URL.createObjectURL(resized);
      setAvatarFile(resized);
      setAvatarPreview(nextPreview);
      return null;
    } catch (error) {
      return getAvatarProcessingErrorKey(error);
    }
  }

  async function selectPreset(preset: DefaultShopPresetOption) {
    presetAbortRef.current?.abort();
    const controller = new AbortController();
    presetAbortRef.current = controller;

    revokeObjectUrlIfNeeded(avatarPreview);
    setShopName(preset[i18n.language as keyof DefaultShopPresetOption]);
    setAvatarPreview(preset.avatar);

    try {
      const response = await fetch(preset.avatar, {
        signal: controller.signal,
      });
      const blob = await response.blob();
      if (controller.signal.aborted) {
        return;
      }
      const file = new File(
        [blob],
        preset.avatar.split("/").pop() ?? "avatar.webp",
        { type: "image/webp" },
      );
      setAvatarFile(file);
    } catch {
      if (!controller.signal.aborted) {
        setAvatarFile(null);
      }
    }
  }

  function clearAvatar() {
    presetAbortRef.current?.abort();
    presetAbortRef.current = null;
    revokeObjectUrlIfNeeded(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview("");
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
    clearAvatar,
    resetDraft,
  };
}
