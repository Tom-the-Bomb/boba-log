import { AUTH_COOKIE_NAME } from "@/lib/api/auth";
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
import { cookies } from "next/headers";
import Landing from "./components/landing/landing";
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

export default async function Home() {
  const signedIn = (await cookies()).has(AUTH_COOKIE_NAME);

  return (
    <>
      <JsonLd
        data={[
          HOME_ORGANIZATION_JSONLD,
          HOME_WEBSITE_JSONLD,
          HOME_WEBPAGE_JSONLD,
        ]}
      />
      <Landing signedIn={signedIn} />
    </>
  );
}
