"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

const noop = () => () => {};

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation("common");
  // The server can't know the theme; render as light until hydrated.
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? t("switchToLight") : t("switchToDark");

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="tap-target relative grid size-10 place-items-center rounded-md text-text-2 hover:bg-hover hover:text-text sm:size-9"
      aria-label={label}
      title={label}
    >
      <Sun size={17} strokeWidth={1.5} className="hidden dark:block" />
      <Moon size={17} strokeWidth={1.5} className="dark:hidden" />
    </button>
  );
}
