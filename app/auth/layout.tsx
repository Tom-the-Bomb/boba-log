import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://boba.tomthebomb.dev";
const SOCIAL_IMAGE_URL = `${SITE_URL}/icon-512.png`;

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
        alt: "Boba Log app icon",
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
