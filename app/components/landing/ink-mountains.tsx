import { preload } from "react-dom";

export default function InkMountains({
  className = "",
}: {
  className?: string;
}) {
  preload("/textures/ink-mountains-narrow.avif", {
    as: "image",
    type: "image/avif",
    fetchPriority: "high",
    // Mask images are fetched in CORS mode; a mismatched preload downloads twice.
    crossOrigin: "anonymous",
    media: "(max-width: 639.98px)",
  });
  preload("/textures/ink-mountains.avif", {
    as: "image",
    type: "image/avif",
    fetchPriority: "high",
    crossOrigin: "anonymous",
    media: "(min-width: 640px)",
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none bg-text mask-[url(/textures/ink-mountains-narrow.avif)] mask-cover mask-bottom mask-no-repeat opacity-(--wash-opacity) sm:mask-[url(/textures/ink-mountains.avif)] ${className}`}
    />
  );
}
