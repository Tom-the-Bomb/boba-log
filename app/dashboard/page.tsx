import type { Metadata } from "next";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Private dashboard for tracking boba shop drinks and trends.",
  alternates: {
    canonical: "/dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
