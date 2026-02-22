import {
  HOME_ORGANIZATION_JSONLD,
  HOME_WEBPAGE_JSONLD,
  HOME_WEBSITE_JSONLD,
} from "@/lib/jsonld/home";
import {
  APP_ICON_ALT,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  SITE_URL,
  SOCIAL_IMAGE_URL,
} from "@/lib/site";
import type { Metadata } from "next";
import Footer from "./components/landing/footer";
import Hero from "./components/landing/hero";
import Nav from "./components/landing/nav";
import JsonLd from "./components/seo/json-ld";

export const metadata: Metadata = {
  title: {
    absolute: DEFAULT_SEO_TITLE,
  },
  description: DEFAULT_SEO_DESCRIPTION,
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
      <JsonLd
        data={[
          HOME_ORGANIZATION_JSONLD,
          HOME_WEBSITE_JSONLD,
          HOME_WEBPAGE_JSONLD,
        ]}
      />

      <Nav />

      <div className="tea-line tea-page-padding" />

      <Hero />

      <div className="tea-line tea-line-bottom tea-page-padding" />
      <Footer />
    </div>
  );
}
