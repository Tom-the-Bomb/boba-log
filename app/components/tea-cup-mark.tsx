import Image from "next/image";

export default function TeaCupMark() {
  return (
    <div className="relative">
      <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 gap-3">
        <span className="steam steam-1" />
        <span className="steam steam-2" />
        <span className="steam steam-3" />
      </div>
      <Image
        src="/icons/tea-cup.svg"
        alt="Tea cup"
        width={120}
        height={100}
        className="h-28 w-auto opacity-20"
        unoptimized
      />
    </div>
  );
}
