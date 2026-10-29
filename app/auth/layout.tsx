import AUTH_JSONLD from "@/lib/jsonld/auth";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import JsonLd from "../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in or create an account to start tracking your boba drinks.",
  alternates: {
    canonical: "/auth",
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={AUTH_JSONLD} />
      {children}
    </>
  );
}
