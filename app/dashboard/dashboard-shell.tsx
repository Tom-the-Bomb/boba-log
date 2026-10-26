"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import AppHeader from "../components/dashboard/app-header";
import ErrorScreen from "../components/error-screen";
import LoadingScreen from "../components/loading-screen";
import { useUser } from "../providers/user-provider";
import { DashboardProvider } from "./dashboard-context";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { user, isLoadingUser, loadFailed, retryLoad } = useUser();
  const { t } = useTranslation("common");
  const router = useRouter();

  // Only a missing session goes to sign in; a failed load stays here to retry.
  useEffect(() => {
    if (!isLoadingUser && !user && !loadFailed) {
      router.replace("/auth");
    }
  }, [isLoadingUser, user, loadFailed, router]);

  if (loadFailed && !isLoadingUser) {
    return (
      <ErrorScreen
        title={t("loadFailedTitle")}
        body={t(loadFailed)}
        action={t("tryAgain")}
        onAction={() => void retryLoad()}
      />
    );
  }

  if (isLoadingUser || !user) {
    return <LoadingScreen />;
  }

  return (
    <DashboardProvider>
      <div className="min-h-dvh">
        <AppHeader />
        {children}
      </div>
    </DashboardProvider>
  );
}
