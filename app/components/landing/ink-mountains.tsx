import { preload } from "react-dom";

/**
 * Ink-wash mountains (山水): a painted plate used as a mask and tinted by the
 * ink colour, so it sits on rice paper in light and as mist in dark. Phones
 * get a narrower plate with fewer, taller peaks.
 */
export default function InkMountains({
  className = "",
}: {
  className?: string;
}) {
  // The plate is the page's largest paint; fetch the one this screen uses
  // with the HTML rather than after the stylesheet.
  preload("/textures/ink-mountains-narrow.avif", {
    as: "image",
    type: "image/avif",
    fetchPriority: "high",
    // CSS fetches mask images in CORS mode; the preload must match or the
    // browser downloads the plate twice.
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
      className={`pointer-events-none bg-text [mask-image:url(/textures/ink-mountains-narrow.avif)] [mask-size:cover] [mask-position:bottom_center] [mask-repeat:no-repeat] opacity-(--wash-opacity) sm:[mask-image:url(/textures/ink-mountains.avif)] ${className}`}
    />
  );
}
