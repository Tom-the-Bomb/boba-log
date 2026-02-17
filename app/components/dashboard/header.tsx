"use client";

import { SITE_NAME } from "@/lib/site";
import { useRouter } from "next/navigation";
import { useUser } from "../../providers/user-provider";
import ThemeToggle from "../theme-toggle";

export default function Header() {
  const router = useRouter();
  const { user, logout: clearAuth } = useUser();

  function handleLogout() {
    clearAuth();
    router.push("/auth");
  }

  return (
    <header className="tea-page-padding tea-border-subtle flex items-center justify-between border-b py-6">
      <div>
        <h1 className="tea-text-primary font-display text-2xl font-medium tracking-tight">
          {SITE_NAME}
        </h1>
        <p className="tea-text-muted tea-caps-10 mt-0.5">
          {user?.username ?? ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button type="button" onClick={handleLogout} className="tea-link">
          Logout
        </button>
      </div>
    </header>
  );
}
