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
      className="inline-flex w-auto items-center gap-1.5 border border-tea-stone bg-tea-mist px-2 py-1.5 text-left hover:border-tea-sage dark:hover:border-tea-matcha"
    >
      <Image
        src={preset.avatar}
        alt={presetName}
        width={22}
        height={22}
        className="h-5.5 w-5.5 rounded-full object-cover"
      />
      <span className="text-xs whitespace-nowrap text-tea-charcoal">
        {presetName}
      </span>
      <span className="text-sm leading-none text-tea-sage">+</span>
    </button>
  );
}
