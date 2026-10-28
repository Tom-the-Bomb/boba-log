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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLdData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
