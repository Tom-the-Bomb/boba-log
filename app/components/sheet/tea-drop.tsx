const RADIUS = [0, 6.4, 7.8, 8.8, 9.6];

interface TeaDropProps {
  count: number;
  /** Writes the count inside from two drinks up. */
  showCount?: boolean;
}

/**
 * A dried drop of tea: the more cups that day, the larger and deeper the
 * drop, with a darker rim where the tea pooled as it dried.
 */
export default function TeaDrop({ count, showCount = true }: TeaDropProps) {
  const level = Math.min(count, 4);
  const r = RADIUS[level];

  return (
    <svg
      viewBox="0 0 22 22"
      aria-hidden="true"
      className="block size-full overflow-visible"
    >
      <circle cx="11" cy="11" r={r} fill={`var(--glaze-${level})`} />
      <circle
        cx="11"
        cy="11"
        r={r - 0.6}
        fill="none"
        stroke={`var(--rim-${level})`}
        strokeWidth="1.2"
      />
      <circle
        cx={11 - r * 0.3}
        cy={11 - r * 0.32}
        r={r * 0.32}
        fill="#fff"
        opacity="0.16"
      />
      {showCount && count >= 2 && (
        <text
          x="11"
          y="15.3"
          textAnchor="middle"
          fontSize={count > 9 ? 10 : 12.5}
          fontWeight="400"
          fill={`var(--drop-num-${level})`}
          className="num @max-[40rem]:hidden"
        >
          {count}
        </text>
      )}
    </svg>
  );
}
