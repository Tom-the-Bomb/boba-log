import Image from "next/image";

export default function TeaLeafMark() {
  return (
    <Image
      src="/icons/tea-leaf.svg"
      alt="Tea leaf"
      width={40}
      height={40}
      className="h-10 w-10"
      priority
      unoptimized
    />
  );
}
