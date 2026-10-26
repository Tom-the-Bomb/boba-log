"use client";

import { useSyncExternalStore, type ReactNode } from "react";

function subscribe() {
  return () => {};
}

/** Renders its children in the browser only; the server sends `fallback`. */
export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  if (!mounted) {
    return fallback;
  }
  return <>{children}</>;
}
