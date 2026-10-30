"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import useMounted from "../hooks/use-mounted";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation("common");
  const isDark = useMounted() && resolvedTheme === "dark";
  const label = isDark ? t("switchToLight") : t("switchToDark");

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="icon-btn size-10 sm:size-9"
      aria-label={label}
      title={label}
    >
      <Sun size={17} strokeWidth={1.5} className="hidden dark:block" />
      <Moon size={17} strokeWidth={1.5} className="dark:hidden" />
    </button>
  );
}
