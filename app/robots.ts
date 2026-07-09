import type { MetadataRoute } from "next";

import { absoluteUrl, getSiteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/panel-rodzica",
          "/panel-zawodnika",
          "/login",
          "/rejestracja",
          "/zapomnialem-hasla",
          "/moje-dzieci",
          "/api/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
