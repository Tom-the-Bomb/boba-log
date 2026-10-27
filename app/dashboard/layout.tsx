import type { ReactNode } from "react";
import LoadingScreen from "../components/loading-screen";
import ClientOnly from "../providers/client-only";
import UserProvider from "../providers/user-provider";
import DashboardShell from "./dashboard-shell";

// Client-only: the log loads in the browser and "today" is the visitor's day.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<LoadingScreen />}>
      <UserProvider>
        <DashboardShell>{children}</DashboardShell>
      </UserProvider>
    </ClientOnly>
  );
}
