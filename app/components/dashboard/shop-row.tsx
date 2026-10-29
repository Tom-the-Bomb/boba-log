"use client";

import { formatDay } from "@/lib/date";
import { translateShopName } from "@/lib/default-shops";
import type { BobaShop } from "@/lib/types";
import { MoreHorizontal, NotebookPen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, MenuTrigger } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { Menu, MenuItem, Popover } from "../ui/overlays";
import ShopAvatar from "./shop-avatar";

interface ShopRowProps {
  shop: BobaShop;
  count: number;
  todayCount: number;
  lastDay: string | null;
  share: number;
  onLog: () => void;
  onLogWithDetails: () => void;
  onDelete: () => void;
}

export default function ShopRow({
  shop,
  count,
  todayCount,
  lastDay,
  share,
  onLog,
  onLogWithDetails,
  onDelete,
}: ShopRowProps) {
  const { t, i18n } = useTranslation("dashboard");
  const name = translateShopName(shop.name, i18n.language);
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    if (!justLogged) {
      return;
    }
    const timeout = window.setTimeout(() => setJustLogged(false), 700);
    return () => window.clearTimeout(timeout);
  }, [justLogged]);

  const meta =
    todayCount > 0
      ? t("todayCount", { count: todayCount })
      : lastDay
        ? t("lastLogged", {
            date: formatDay(lastDay, i18n.language, {
              month: "short",
              day: "numeric",
            }),
          })
        : t("neverLogged");

  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto_auto] items-center gap-x-3 border-b border-rule py-3.5 sm:gap-x-4">
      <ShopAvatar src={shop.avatar} name={name} />
      <div className="min-w-0">
        <p className="truncate text-[15px] text-text">{name}</p>
        <p className="mt-0.5 truncate text-xs text-text-2">{meta}</p>
        <span
          aria-hidden="true"
          className="mt-2 block h-0.5 max-w-36 rounded-full bg-rule"
        >
          <span
            className="block h-full rounded-full bg-glaze-2"
            style={{ width: `${Math.round(share * 100)}%` }}
          />
        </span>
      </div>
      <span className="min-w-12 text-right font-kai text-3xl leading-none text-text tabular-nums">
        {count}
      </span>
      <div className="flex items-center gap-1">
        <MenuTrigger>
          <Button
            aria-label={t("shopMenuAria", { name })}
            className="icon-btn size-10 text-text-3 outline-none hover:text-text data-focus-visible:focus-ring sm:size-9"
          >
            <MoreHorizontal size={17} strokeWidth={1.5} />
          </Button>
          <Popover placement="bottom end" className="w-56">
            <Menu
              aria-label={t("shopMenuAria", { name })}
              onAction={(key) =>
                key === "delete" ? onDelete() : onLogWithDetails()
              }
            >
              <MenuItem id="details">
                <NotebookPen
                  size={15}
                  strokeWidth={1.5}
                  className="text-text-2"
                />
                {t("logWithDetails")}
              </MenuItem>
              <MenuItem id="delete" tone="danger">
                <Trash2 size={15} strokeWidth={1.5} />
                {t("deleteShop")}
              </MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
        <button
          type="button"
          onClick={() => {
            setJustLogged(true);
            onLog();
          }}
          aria-label={t("logDrinkAria", { name })}
          className={`tap-target relative grid size-11 place-items-center rounded-md border border-transparent text-sm steep sm:size-10 ${
            justLogged
              ? "bg-glaze-4 text-on-accent"
              : "bg-band text-text hover:bg-glaze-1"
          }`}
        >
          +1
        </button>
      </div>
    </li>
  );
}
