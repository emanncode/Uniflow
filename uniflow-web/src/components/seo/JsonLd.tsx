import {
  organizationJsonLd,
  softwareJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export default function JsonLd() {
  const schemas = [organizationJsonLd, websiteJsonLd, softwareJsonLd];

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}