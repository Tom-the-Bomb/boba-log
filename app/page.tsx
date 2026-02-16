import type { Metadata } from "next";
import Footer from "./components/landing/footer";
import Hero from "./components/landing/hero";
import Nav from "./components/landing/nav";

const SITE_URL = "https://boba.tomthebomb.dev";
const SOCIAL_IMAGE_URL = `${SITE_URL}/icon-512.png`;

export const metadata: Metadata = {
  title: "Home",
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
        alt: "Boba Log app icon",
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
