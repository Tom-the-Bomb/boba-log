import type { Metadata } from "next";
import type { ReactNode } from "react";
import UserProvider from "../providers/user-provider";
import DashboardShell from "./dashboard-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}
