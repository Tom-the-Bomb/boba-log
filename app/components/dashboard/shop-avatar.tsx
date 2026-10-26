import Image from "next/image";

interface ShopAvatarProps {
  src: string | null;
  name: string;
  size?: number;
}

export default function ShopAvatar({ src, name, size = 36 }: ShopAvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized
        className="shrink-0 rounded-full object-cover ring-1 ring-rule"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full bg-glaze-1 font-kai text-accent-ink"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {Array.from(name.trim())[0]?.toUpperCase() ?? "·"}
    </span>
  );
}
