"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, MenuTrigger } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { useUser } from "../../providers/user-provider";
import SealMark from "../brand/seal-mark";
import LanguageToggle from "../language-toggle";
import ThemeToggle from "../theme-toggle";
import { Menu, MenuItem, Popover } from "../ui/overlays";
import RangePicker from "./range-picker";

const TABS = [
  { href: "/dashboard", key: "tabLog" },
  { href: "/dashboard/drinks", key: "tabDrinks" },
  { href: "/dashboard/settings", key: "tabSettings" },
] as const;

function AccountMenu() {
  const { user, logout } = useUser();
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");

  return (
    <MenuTrigger>
      <Button
        aria-label={tc("account")}
        className="tap-target relative flex h-10 max-w-40 min-w-0 items-center rounded-md px-2 text-sm text-text-2 outline-none hover:bg-hover hover:text-text data-focus-visible:focus-ring sm:h-9"
      >
        <span className="truncate">{user?.username}</span>
      </Button>
      <Popover placement="bottom end" className="w-60">
        <p className="truncate px-3 pt-2 pb-2.5 text-sm text-text-2">
          {t("signedInAs", { username: user?.username ?? "" })}
        </p>
        <Menu
          aria-label={tc("account")}
          onAction={async () => {
            await logout();
            // A full load drops the signed-out account from memory, and
            // replacing the entry keeps Back off a dashboard that would bounce.
            window.location.replace("/auth");
          }}
        >
          <MenuItem id="logout">
            <LogOut size={15} strokeWidth={1.5} className="text-text-2" />
            {tc("logout")}
          </MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

export default function AppHeader() {
  const pathname = usePathname();
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");
  const showRange = pathname !== "/dashboard/settings";

  const tabs = (
    <nav
      aria-label="Dashboard"
      className="flex h-full items-stretch gap-6 sm:gap-7"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`tap-target relative flex items-center text-sm ${
              active
                ? "text-text shadow-[inset_0_-1px_0_var(--text)] forced-colors:border-b-2"
                : "text-text-2 hover:text-text"
            }`}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="border-b border-rule">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-surface text-sm text-text shadow-(--lift) focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2"
      >
        {tc("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-8 sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label={tc("siteName")}
          className="tap-target relative flex shrink-0 items-center gap-2.5 font-kai text-xl whitespace-nowrap text-text"
        >
          <SealMark />
          <span className="max-[359px]:hidden">{tc("siteName")}</span>
        </Link>
        <div className="hidden h-full md:block">{tabs}</div>
        <div className="ml-auto flex min-w-0 items-center gap-0.5 sm:gap-1">
          {showRange && (
            <div className="mr-2 hidden md:block">
              <RangePicker />
            </div>
          )}
          <LanguageToggle />
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
      <div className="flex h-12 items-stretch justify-between gap-4 border-t border-rule px-4 sm:px-8 md:hidden">
        {tabs}
        {showRange && (
          <div className="flex items-center">
            <RangePicker />
          </div>
        )}
      </div>
    </header>
  );
}
