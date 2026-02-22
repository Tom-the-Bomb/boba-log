"use client";

import { useTranslation } from "react-i18next";
import { useUser } from "../../providers/user-provider";
import LanguageToggle from "../language-toggle";
import ThemeToggle from "../theme-toggle";

export default function Nav() {
  const { user, logout } = useUser();
  const { t } = useTranslation("common");

  return (
    <header className="tea-page-padding flex items-center justify-between border-b border-tea-stone py-6">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight text-tea-charcoal">
          {t("siteName")}
        </h1>
        <p className="tea-caps-10 mt-0.5 text-tea-faint">
          {user?.username ?? ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
        <button
          type="button"
          onClick={async () => {
            await logout();
            window.location.href = "/auth";
          }}
          className="tea-link px-2"
        >
          {t("logout")}
        </button>
      </div>
    </header>
  );
}
