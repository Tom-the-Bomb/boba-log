import {
  AUTHOR_NAME,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE_URL,
} from "@/lib/site";
import type { Organization, WebPage, WebSite } from "schema-dts";

export const HOME_ORGANIZATION_JSONLD: Organization = {
  "@type": "Organization",
  "@id": `${SITE_URL}#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  founder: {
    "@type": "Person",
    name: AUTHOR_NAME,
  },
};

export const HOME_WEBSITE_JSONLD: WebSite = {
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: SITE_NAME,
  headline: DEFAULT_SEO_TITLE,
  description: DEFAULT_SEO_DESCRIPTION,
  inLanguage: "en",
  publisher: {
    "@id": `${SITE_URL}#organization`,
  },
};

export const HOME_WEBPAGE_JSONLD: WebPage = {
  "@type": "WebPage",
  "@id": `${SITE_URL}#webpage`,
  url: SITE_URL,
  name: DEFAULT_SEO_TITLE,
  description: DEFAULT_SEO_DESCRIPTION,
  inLanguage: "en",
  isPartOf: {
    "@id": `${SITE_URL}#website`,
  },
  about: {
    "@id": `${SITE_URL}#organization`,
  },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: SOCIAL_IMAGE_URL,
  },
};
