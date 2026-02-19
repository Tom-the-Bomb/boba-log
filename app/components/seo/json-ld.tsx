import Script from "next/script";
import type { Thing, WithContext } from "schema-dts";

interface JsonLdProps {
  data: WithContext<Thing> | readonly Thing[];
}

export default function JsonLd({ data }: JsonLdProps) {
  const jsonLdData = Array.isArray(data)
    ? {
        "@context": "https://schema.org",
        "@graph": data,
      }
    : data;

  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      strategy="beforeInteractive"
    >
      {JSON.stringify(jsonLdData).replace(/</g, "\\u003c")}
    </Script>
  );
}
