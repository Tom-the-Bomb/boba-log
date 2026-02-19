"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useUser } from "../../providers/user-provider";
import LanguageToggle from "../language-toggle";
import ThemeToggle from "../theme-toggle";

export default function Nav() {
  const router = useRouter();
  const { user, logout: clearAuth } = useUser();
  const { t } = useTranslation("common");

  return (
    <header className="tea-page-padding tea-border-subtle flex items-center justify-between border-b py-6">
      <div>
        <h1 className="tea-text-primary font-display text-2xl font-medium tracking-tight">
          {t("siteName")}
        </h1>
        <p className="tea-text-muted tea-caps-10 mt-0.5">
          {user?.username ?? ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
        <button
          type="button"
          onClick={async () => {
            await clearAuth();
            router.push("/auth");
          }}
          className="tea-link px-2"
        >
          {t("logout")}
        </button>
      </div>
    </header>
  );
}
