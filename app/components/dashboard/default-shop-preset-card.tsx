"use client";

import type { DefaultShopPresetOption } from "@/lib/default-shops";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface DefaultShopPresetCardProps {
  preset: DefaultShopPresetOption;
  onSelect: (preset: DefaultShopPresetOption) => void;
}

export default function DefaultShopPresetCard({
  preset,
  onSelect,
}: DefaultShopPresetCardProps) {
  const { i18n } = useTranslation();
  const presetName = preset[i18n.language as keyof DefaultShopPresetOption];

  return (
    <button
      key={presetName}
      type="button"
      onClick={() => onSelect(preset)}
      className="tea-border-subtle tea-border-accent-hover tea-surface-muted inline-flex w-auto items-center gap-1.5 border px-2 py-1.5 text-left dark:hover:border-(--tea-matcha)"
    >
      <Image
        src={preset.avatar}
        alt={presetName}
        width={22}
        height={22}
        className="h-5.5 w-5.5 rounded-full object-cover"
      />
      <span className="tea-text-primary text-xs whitespace-nowrap">
        {presetName}
      </span>
      <span className="tea-text-accent text-sm leading-none">+</span>
    </button>
  );
}
