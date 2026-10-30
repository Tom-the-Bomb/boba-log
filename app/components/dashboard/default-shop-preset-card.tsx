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
      type="button"
      onClick={() => onSelect(preset)}
      className="tap-target relative inline-flex h-9 items-center gap-2 rounded-full border border-rule bg-ground py-1 pr-3.5 pl-1 text-left hover:border-rule-strong"
    >
      <Image
        src={preset.avatar}
        alt=""
        width={26}
        height={26}
        className="size-6.5 rounded-full object-cover"
      />
      <span className="text-sm whitespace-nowrap text-text">{presetName}</span>
    </button>
  );
}
