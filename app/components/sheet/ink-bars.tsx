import type { ReactNode } from "react";

const GAP = "gap-x-[clamp(4px,1.4vw,18px)]";

export interface InkBar {
  key: string;
  label: ReactNode;
  description: string;
  value: number;
  display?: string;
}

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
      <ol
        className={`flex min-h-0 flex-1 ${GAP} border-b border-rule-strong pt-7`}
      >
        {bars.map((bar) => (
          <li
            key={bar.key}
            aria-label={bar.description}
            className="relative flex min-w-0 flex-1 items-end justify-center"
          >
            <span
              title={bar.description}
              className="group relative flex w-full max-w-12 flex-col"
              style={{
                height:
                  bar.value > 0 ? `max(3px, ${(bar.value / max) * 100}%)` : "0",
              }}
            >
              <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 font-kai text-sm whitespace-nowrap text-text tabular-nums group-hover:text-accent-ink">
                {bar.display ?? bar.value}
              </span>
              <span aria-hidden="true" className="ink-bar flex-1" />
            </span>
          </li>
        ))}
      </ol>
      <ol aria-hidden="true" className={`mt-2 flex ${GAP}`}>
        {bars.map((bar) => (
          <li
            key={bar.key}
            className="flex min-w-0 flex-1 justify-center text-xs whitespace-nowrap text-text-2"
          >
            {bar.label}
          </li>
        ))}
      </ol>
    </figure>
  );
}
