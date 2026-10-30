import { AUTH_COOKIE_NAME } from "@/lib/api/auth";
import {
  HOME_ORGANIZATION_JSONLD,
  HOME_WEBPAGE_JSONLD,
  HOME_WEBSITE_JSONLD,
} from "@/lib/jsonld/home";
import { cookies } from "next/headers";
import Landing from "./components/landing/landing";
import JsonLd from "./components/seo/json-ld";

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
