import type { ReactNode } from "react";
import LoadingScreen from "../components/loading-screen";
import ClientOnly from "../providers/client-only";
import UserProvider from "../providers/user-provider";
import DashboardShell from "./dashboard-shell";

// Rendered in the browser only: the log loads there anyway, and "today"
// depends on the visitor's timezone.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<LoadingScreen />}>
      <UserProvider>
        <DashboardShell>{children}</DashboardShell>
      </UserProvider>
    </ClientOnly>
  );
}
