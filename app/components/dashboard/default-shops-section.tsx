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
      const items = Array.from(container.children) as HTMLElement[];
      if (items.length === 0) {
        dispatch({ type: "measured", isCollapsible: false });
        return;
      }

      const firstTop = items[0].offsetTop;
      let hasMultipleRows = false;

      for (const item of items) {
        if (item.offsetTop > firstTop + 1) {
          hasMultipleRows = true;
          break;
        }
      }

      dispatch({ type: "measured", isCollapsible: hasMultipleRows });
    };

    const initialMeasureFrame = requestAnimationFrame(measure);

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    for (const child of Array.from(container.children)) {
      observer.observe(child);
    }

    addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(initialMeasureFrame);
      observer.disconnect();
      removeEventListener("resize", measure);
    };
  }, [dispatch]);

  return (
    <div>
      <p className="tea-text-muted tea-caps-10 mb-2 block">{t("presets")}</p>
      <div
        className={`overflow-hidden ${
          presets.hasMeasured ? "transition-[max-height] duration-200" : ""
        } ${!presets.isExpanded ? "max-h-9" : "max-h-125"}`}
      >
        <div ref={containerRef} className="flex flex-wrap gap-2">
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
          className="tea-link mt-2 inline-flex items-center gap-1 py-1.5 text-[10px]!"
        >
          {presets.isExpanded ? t("showLess") : t("showMore")}
          <ChevronDown
            aria-hidden="true"
            className={`h-3 w-3 transition-transform ${presets.isExpanded ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  );
}
