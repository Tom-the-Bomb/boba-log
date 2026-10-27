"use client";

import {
  DEFAULT_SHOPS,
  type DefaultShopPresetOption,
} from "@/lib/default-shops";
import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import usePresetsReducer from "../../reducers/presets-reducer";
import DefaultShopPresetCard from "./default-shop-preset-card";

interface DefaultShopsSectionProps {
  onPresetSelect: (preset: DefaultShopPresetOption) => void;
}

export default function DefaultShopsSection({
  onPresetSelect,
}: DefaultShopsSectionProps) {
  const { t } = useTranslation("dashboard");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [presets, dispatch] = usePresetsReducer();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const measure = () => {
      const items = [...container.children] as HTMLElement[];
      const firstTop = items[0]?.offsetTop ?? 0;
      dispatch({
        type: "measured",
        isCollapsible: items.some((item) => item.offsetTop > firstTop + 1),
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [dispatch]);

  return (
    <div>
      <p className="label">{t("presets")}</p>
      <div
        className={`overflow-hidden ${
          presets.hasMeasured ? "transition-[max-height] duration-200" : ""
        } ${!presets.isExpanded ? "max-h-9.5" : "max-h-125"}`}
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
      {presets.isCollapsible && (
        <button
          type="button"
          onClick={() => dispatch({ type: "toggle" })}
          className="mt-2 inline-flex items-center gap-1 rounded-md py-1.5 text-sm text-accent-ink hover:underline"
        >
          {presets.isExpanded ? t("showLess") : t("showMore")}
          <ChevronDown
            aria-hidden="true"
            className={`size-3.5 ${presets.isExpanded ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  );
}
