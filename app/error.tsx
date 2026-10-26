"use client";

import { useTranslation } from "react-i18next";
import ErrorScreen from "./components/error-screen";

// A page failed to render or to load one of its files (as can happen just
// after a new release). A fresh load recovers from both.
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
