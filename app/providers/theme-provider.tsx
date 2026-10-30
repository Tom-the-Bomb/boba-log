"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, type ReactNode } from "react";

export const THEME_STORAGE_KEY = "boba_theme";

function ThemeColor() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    // Waits a frame for the theme class to apply.
    const frame = requestAnimationFrame(() => {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue("--ground")
        .trim();
      document
        .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
        .forEach((meta) => meta.setAttribute("content", color));
    });
    return () => cancelAnimationFrame(frame);
  }, [resolvedTheme]);
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      storageKey={THEME_STORAGE_KEY}
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemeColor />
      {children}
    </NextThemesProvider>
  );
}
