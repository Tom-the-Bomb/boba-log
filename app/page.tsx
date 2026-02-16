import {
  APP_ICON_ALT,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE_URL,
} from "@/lib/site";
import type { Metadata } from "next";
import Footer from "./components/landing/footer";
import Hero from "./components/landing/hero";
import Nav from "./components/landing/nav";

export const metadata: Metadata = {
  title: {
    absolute: SITE_NAME,
  },
  description:
    "Track your tea ritual with boba shop logging, drink totals, and simple trend insights.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: SITE_URL,
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

export default function Home() {
  return (
    <div className="tea-grid-bg relative flex min-h-screen flex-col">
      <Nav />

      <div className="tea-line tea-page-padding" />

      <Hero />

      <div className="tea-line tea-line-bottom tea-page-padding" />
      <Footer />
    </div>
  );
}
