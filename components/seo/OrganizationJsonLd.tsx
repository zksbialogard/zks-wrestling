import { CLUB_NAME } from "@/lib/design-tokens";
import { absoluteUrl, getSiteUrl } from "@/lib/site-config";

export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: CLUB_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl("/logo-shield.png"),
    description:
      "Klub sportowy ZKS Białogard — zapasy, treningi młodzieżowe i zawody. Oficjalna aplikacja klubowa dla rodziców i zawodników.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Grunwaldzka 46",
      addressLocality: "Białogard",
      postalCode: "78-200",
      addressCountry: "PL",
    },
    sameAs: [absoluteUrl("/")],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
