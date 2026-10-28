export function SealCarveFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="seal-carve">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.7"
          numOctaves="2"
          seed="3"
        />
        <feDisplacementMap in="SourceGraphic" scale="1.6" />
      </filter>
    </svg>
  );
}

interface SealMarkProps {
  size?: number;
  text?: string;
}

export default function SealMark({ size = 30, text = "茶记" }: SealMarkProps) {
  return (
    <span
      aria-hidden="true"
      className="inline-grid shrink-0 place-items-center rounded-sm bg-seal font-kai leading-[1.05] text-on-seal filter-[url(#seal-carve)] [writing-mode:vertical-rl]"
      style={{
        width: size,
        height: size,
        fontSize: text.length > 1 ? size * 0.4 : size * 0.6,
        letterSpacing: text.length > 1 ? size * 0.02 : 0,
      }}
    >
      {text}
    </span>
  );
}
