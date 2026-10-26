import type { ReactNode } from "react";

export interface InkBar {
  key: string;
  label: ReactNode;
  /** Spoken and hover text, e.g. "May · 18 drinks". */
  description: string;
  value: number;
  /** Written above the column instead of the raw value, e.g. "$42". */
  display?: string;
}

/**
 * Columns of ink wash, darkest at the brush's first touch and thinning toward
 * the paper, each with its count written above in Kai.
 */
export default function InkBars({
  bars,
  label,
}: {
  bars: readonly InkBar[];
  label: string;
}) {
  const max = Math.max(1, ...bars.map((bar) => bar.value));

  return (
    <figure className="flex h-full flex-col" aria-label={label}>
      <ol className="flex min-h-0 flex-1 gap-x-[clamp(4px,1.4vw,18px)] border-b border-rule-strong pt-7">
        {bars.map((bar) => (
          <li
            key={bar.key}
            aria-label={bar.description}
            className="relative flex min-w-0 flex-1 items-end justify-center"
          >
            {/* The bar and its value answer the pointer, not the empty
                column above them. */}
            <span
              title={bar.description}
              className="group relative flex w-full max-w-12 flex-col"
              style={{
                height:
                  bar.value > 0 ? `max(3px, ${(bar.value / max) * 100}%)` : "0",
              }}
            >
              <span className="num absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 font-kai text-sm whitespace-nowrap text-text group-hover:text-accent-ink">
                {bar.display ?? bar.value}
              </span>
              <span aria-hidden="true" className="ink-bar flex-1" />
            </span>
          </li>
        ))}
      </ol>
      <ol
        aria-hidden="true"
        className="mt-2 flex gap-x-[clamp(4px,1.4vw,18px)]"
      >
        {bars.map((bar) => (
          <li
            key={bar.key}
            className="flex min-w-0 flex-1 justify-center text-xs text-text-2"
          >
            {bar.label}
          </li>
        ))}
      </ol>
    </figure>
  );
}
