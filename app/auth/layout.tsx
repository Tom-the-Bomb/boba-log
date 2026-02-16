import AUTH_JSONLD from "@/lib/jsonld/auth";
import { APP_ICON_ALT, SITE_URL, SOCIAL_IMAGE_URL } from "@/lib/site";
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
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    url: `${SITE_URL}/auth`,
    images: [
      {
        url: SOCIAL_IMAGE_URL,
        width: 512,
        height: 512,
        alt: APP_ICON_ALT,
      },
    ],
  },
  twitter: {
    images: [SOCIAL_IMAGE_URL],
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
