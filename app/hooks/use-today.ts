"use client";

import { localToday } from "@/lib/date";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
  };
}

export default function useToday() {
  return useSyncExternalStore(subscribe, localToday, localToday);
}
