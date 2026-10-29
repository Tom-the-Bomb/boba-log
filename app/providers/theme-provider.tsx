"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ReactNode } from "react";
import useMounted from "../hooks/use-mounted";

export const THEME_STORAGE_KEY = "boba_theme";

function ThemeColor() {
  const { resolvedTheme } = useTheme();
  const dark = useMounted() && resolvedTheme === "dark";
  return <meta name="theme-color" content={dark ? "#1a1816" : "#f4f0e8"} />;
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
