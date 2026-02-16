import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { WebPage, WithContext } from "schema-dts";

const AUTH_JSONLD: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `Sign In | ${SITE_NAME}`,
  description:
    "Sign in or create an account to start tracking your boba drinks.",
  url: `${SITE_URL}/auth`,
  inLanguage: "en",
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
};

export default AUTH_JSONLD;
