interface SealMarkProps {
  size?: number;
  /** Characters cut into the seal, read top to bottom. */
  text?: string;
  className?: string;
}

/** A cinnabar seal (印章) with white characters, the mark of Boba Log. */
export default function SealMark({
  size = 30,
  text = "茶记",
  className = "",
}: SealMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-[4px] bg-seal font-kai text-on-seal [writing-mode:vertical-rl] ${className}`}
      style={{
        filter: "url(#seal-carve)",
        width: size,
        height: size,
        fontSize: text.length > 1 ? size * 0.4 : size * 0.6,
        lineHeight: 1.05,
        letterSpacing: text.length > 1 ? size * 0.02 : 0,
      }}
    >
      {text}
    </span>
  );
}
