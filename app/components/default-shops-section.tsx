"use client";

import type { DefaultShopPresetOption } from "@/lib/default-shops";
import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import DefaultShopPresetCard from "./default-shop-preset-card";

interface DefaultShopsSectionProps {
  presets: readonly DefaultShopPresetOption[];
  onPresetSelect: (preset: DefaultShopPresetOption) => void;
}

export default function DefaultShopsSection({
  presets,
  onPresetSelect,
}: DefaultShopsSectionProps) {
  const presetsContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasMeasured, setHasMeasured] = useState(false);
  const [isPresetsCollapsible, setIsPresetsCollapsible] = useState(false);
  const [isPresetsExpanded, setIsPresetsExpanded] = useState(false);

  useLayoutEffect(() => {
    const container = presetsContainerRef.current;
    if (!container) return;
    setHasMeasured(false);

    const measure = () => {
      const items = Array.from(container.children) as HTMLElement[];
      if (items.length === 0) {
        setIsPresetsCollapsible(false);
        setHasMeasured(true);
        return;
      }

      const firstTop = items[0].offsetTop;
      let hasMultipleRows = false;

      for (const item of items) {
        if (item.offsetTop > firstTop + 1) {
          hasMultipleRows = true;
        }
      }

      setIsPresetsCollapsible(hasMultipleRows);
      if (!hasMultipleRows) {
        setIsPresetsExpanded(false);
      }
      setHasMeasured(true);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    for (const child of Array.from(container.children)) {
      observer.observe(child);
    }

    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [presets]);

  return (
    <div>
      <p className="tea-text-muted mb-2 block text-[10px] tracking-[0.2em] uppercase">
        Presets
      </p>
      <div
        className={`overflow-hidden ${
          hasMeasured ? "transition-[max-height] duration-200" : ""
        } ${!isPresetsExpanded ? "max-h-9" : "max-h-125"}`}
      >
        <div ref={presetsContainerRef} className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <DefaultShopPresetCard
              key={preset.name}
              preset={preset}
              onSelect={onPresetSelect}
            />
          ))}
        </div>
      </div>
      {isPresetsCollapsible && (
        <button
          type="button"
          onClick={() => setIsPresetsExpanded((current) => !current)}
          className="tea-link mt-2 inline-flex items-center gap-1 py-1.5 text-[10px]"
        >
          {isPresetsExpanded ? "Show less" : "Show more"}
          <ChevronDown
            aria-hidden="true"
            className={`h-3 w-3 transition-transform ${isPresetsExpanded ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  );
}
