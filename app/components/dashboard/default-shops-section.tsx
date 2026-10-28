"use client";

import {
  DEFAULT_SHOPS,
  type DefaultShopPresetOption,
} from "@/lib/default-shops";
import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DefaultShopPresetCard from "./default-shop-preset-card";

interface DefaultShopsSectionProps {
  onPresetSelect: (preset: DefaultShopPresetOption) => void;
}

export default function DefaultShopsSection({
  onPresetSelect,
}: DefaultShopsSectionProps) {
  const { t } = useTranslation("dashboard");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const measure = () => {
      const items = [...container.children] as HTMLElement[];
      const firstTop = items[0]?.offsetTop ?? 0;
      const collapsible = items.some((item) => item.offsetTop > firstTop + 1);
      setIsCollapsible(collapsible);
      if (!collapsible) {
        setIsExpanded(false);
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <p className="label">{t("presets")}</p>
      <div
        className={`overflow-hidden transition-[max-height] duration-200 ${
          isExpanded ? "max-h-125" : "max-h-9.5"
        }`}
      >
        <div ref={containerRef} className="flex flex-wrap gap-2 p-px">
          {DEFAULT_SHOPS.map((preset) => (
            <DefaultShopPresetCard
              key={preset.en}
              preset={preset}
              onSelect={onPresetSelect}
            />
          ))}
        </div>
      </div>
      {isCollapsible && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 inline-flex items-center gap-1 rounded-md py-1.5 text-sm text-accent-ink hover:underline"
        >
          {isExpanded ? t("showLess") : t("showMore")}
          <ChevronDown
            aria-hidden="true"
            className={`size-3.5 ${isExpanded ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  );
}
