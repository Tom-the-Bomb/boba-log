"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  Modal as AriaModal,
  Popover as AriaPopover,
  Button,
  Dialog,
  Heading,
  ModalOverlay,
  type MenuItemProps,
  type MenuProps,
  type PopoverProps,
} from "react-aria-components";
import { useTranslation } from "react-i18next";

/** A floating panel anchored to its trigger. */
export function Popover({
  className = "",
  ...props
}: PopoverProps & { className?: string }) {
  return (
    <AriaPopover
      offset={8}
      {...props}
      className={`rounded-lg border border-rule bg-surface p-1.5 shadow-(--lift) outline-none ${className}`}
    />
  );
}

export function Menu<T extends object>(props: MenuProps<T>) {
  return <AriaMenu {...props} className="outline-none" />;
}

export function MenuItem({
  tone = "default",
  className = "",
  ...props
}: MenuItemProps & { tone?: "default" | "danger"; className?: string }) {
  return (
    <AriaMenuItem
      {...props}
      className={`flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm outline-none data-focused:bg-hover pointer-coarse:h-11 ${
        tone === "danger" ? "text-danger" : "text-text"
      } ${className}`}
    />
  );
}

interface ModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A centred dialog over a scrim: focus is contained and Escape closes it. */
export function Modal({
  isOpen,
  onOpenChange,
  title,
  children,
  className = "max-w-md",
}: ModalProps) {
  const { t } = useTranslation("common");

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-(--scrim) p-4"
    >
      <AriaModal
        className={`w-full rounded-lg border border-rule bg-surface shadow-(--lift) ${className}`}
      >
        <Dialog className="px-6 pt-5 pb-6 outline-none sm:px-8 sm:pt-6 sm:pb-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <Heading slot="title" className="font-kai text-2xl text-text">
              {title}
            </Heading>
            <Button
              slot="close"
              aria-label={t("close")}
              className="tap-target relative -mr-2 grid size-9 shrink-0 place-items-center rounded-md text-text-2 outline-none hover:bg-hover hover:text-text data-focus-visible:focus-ring"
            >
              <X size={18} strokeWidth={1.5} />
            </Button>
          </div>
          {children}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}
