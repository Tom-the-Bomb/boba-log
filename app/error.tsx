"use client";

import { useTranslation } from "react-i18next";
import ErrorScreen from "./components/error-screen";

export default function PageError() {
  const { t } = useTranslation("common");

  return (
    <ErrorScreen
      title={t("errorTitle")}
      body={t("errorBody")}
      action={t("reload")}
      onAction={() => window.location.reload()}
    />
  );
}
