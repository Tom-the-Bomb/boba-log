import { APP_ICON_ALT, SITE_URL, SOCIAL_IMAGE_URL } from "@/lib/site";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in or create an account to start tracking your boba drinks.",
  alternates: {
    canonical: "/auth",
  },
  robots: {
    index: false,
    follow: false,
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
  return children;
}
