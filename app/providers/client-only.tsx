"use client";

import type { ReactNode } from "react";
import useMounted from "../hooks/use-mounted";

export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useMounted() ? children : fallback;
}
