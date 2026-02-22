export default function TeaCupMark() {
  return (
    <div className="relative dark:text-tea-stone">
      <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 gap-3">
        <span className="steam steam-1" />
        <span className="steam steam-2" />
        <span className="steam steam-3" />
      </div>
      <svg
        viewBox="0 0 120 100"
        fill="none"
        className="h-28 w-auto opacity-10 dark:opacity-40"
        aria-hidden="true"
      >
        <path
          d="M20 30 L25 80 Q30 90 60 92 Q90 90 95 80 L100 30 Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M100 40 Q116 42 116 58 Q116 74 100 70"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <ellipse
          cx="60"
          cy="92"
          rx="50"
          ry="6"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
