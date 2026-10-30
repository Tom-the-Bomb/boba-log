"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { RefObject } from "react";

export default function InvisibleTurnstile({
  ref,
}: {
  ref: RefObject<TurnstileInstance | null>;
}) {
  return (
    <div inert>
      <Turnstile
        ref={ref}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        options={{ size: "invisible" }}
        className="h-0 overflow-hidden"
      />
    </div>
  );
}
