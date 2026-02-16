"use client";

import type { DefaultShopPresetOption } from "@/lib/default-shops";
import Image from "next/image";

interface DefaultShopPresetCardProps {
  preset: DefaultShopPresetOption;
  onSelect: (preset: DefaultShopPresetOption) => void;
}

export default function DefaultShopPresetCard({
  preset,
  onSelect,
}: DefaultShopPresetCardProps) {
  return (
    <button
      key={preset.name}
      type="button"
      onClick={() => onSelect(preset)}
      className="tea-border-subtle tea-border-accent-hover tea-surface-muted inline-flex w-auto items-center gap-1.5 border px-2 py-1.5 text-left"
    >
      <Image
        src={preset.avatar}
        alt={preset.name}
        width={22}
        height={22}
        className="h-5.5 w-5.5 rounded-full object-cover"
        unoptimized
      />
      <span className="tea-text-primary text-xs whitespace-nowrap">
        {preset.name}
      </span>
      <span className="tea-text-accent text-sm leading-none">+</span>
    </button>
  );
}
