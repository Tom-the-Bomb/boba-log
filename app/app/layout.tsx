import type { ReactNode } from "react";
import UserProvider from "../providers/user-provider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
