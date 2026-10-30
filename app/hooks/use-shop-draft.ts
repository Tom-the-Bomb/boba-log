"use client";

import type { DefaultShopPresetOption } from "@/lib/default-shops";
import { resizeImageToWebP } from "@/lib/resize-image";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function useShopDraft() {
  const { i18n } = useTranslation();
  const [shopName, setShopName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function startAvatarRequest() {
    avatarRequest.current?.abort();
    avatarRequest.current = new AbortController();
    return avatarRequest.current.signal;
  }

  function setAvatar(file: File | null, preview: string) {
    setAvatarFile(file);
    setAvatarPreview(preview);
  }

  async function handleAvatarInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<string | null> {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return null;
    }
    if (file.type && !file.type.toLowerCase().startsWith("image/")) {
      return "invalidAvatarFormat";
    }

    const signal = startAvatarRequest();
    try {
      const resized = await resizeImageToWebP(file);
      if (!signal.aborted) {
        setAvatar(resized, URL.createObjectURL(resized));
      }
      return null;
    } catch (error) {
      return error instanceof DOMException || error instanceof TypeError
        ? "unsupportedImageFormat"
        : "couldNotProcessImage";
    }
  }

  async function selectPreset(preset: DefaultShopPresetOption, setName = true) {
    const signal = startAvatarRequest();
    if (setName) {
      setShopName(preset[i18n.language as keyof DefaultShopPresetOption]);
    }
    setAvatar(null, preset.avatar);

    try {
      const response = await fetch(preset.avatar, { signal });
      if (!response.ok) {
        throw new Error(`Preset avatar returned ${response.status}`);
      }
      const blob = await response.blob();
      if (!signal.aborted) {
        const name = preset.avatar.split("/").pop() ?? "avatar.webp";
        setAvatarFile(new File([blob], name, { type: "image/webp" }));
      }
    } catch {
      if (!signal.aborted) {
        setAvatar(null, "");
      }
    }
  }

  function clearAvatar() {
    avatarRequest.current?.abort();
    setAvatar(null, "");
  }

  function resetDraft() {
    clearAvatar();
    setShopName("");
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
