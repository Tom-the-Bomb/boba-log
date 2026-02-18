"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../providers/theme-provider";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation("common");

  const label = isDark ? t("switchToLight") : t("switchToDark");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="tea-icon-btn"
      aria-label={label}
      title={label}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
