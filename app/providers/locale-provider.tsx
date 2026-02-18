"use client";

import i18n from "@/i18n";
import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

export default function LocaleProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
