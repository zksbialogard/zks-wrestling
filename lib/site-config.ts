import type { Metadata } from "next";

import { APP_NAME, CLUB_NAME } from "./design-tokens";

/** Docelowa domena produkcyjna — ustaw w Vercel jako NEXT_PUBLIC_SITE_URL. */
export const SITE_CANONICAL_HOST = "app.zksbialogard.pl";

export const SITE_DEFAULT_DESCRIPTION =
  "Oficjalna aplikacja klubowa ZKS Białogard — zawody zapasy, aktualności, treningi, panel rodzica i zawodnika.";

export const PUBLIC_INDEXABLE_PATHS = [
  "/",
  "/aktualnosci",
  "/galeria",
  "/kontakt",
  "/klub/o-klubie",
  "/zawody",
  "/zawody/najblizsze-zawody",
  "/zawody/wyniki-zawodow",
  "/pobierz",
] as const;

export function getSiteUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return `https://${SITE_CANONICAL_HOST}`;
}

export function getCanonicalHost() {
  try {
    return new URL(getSiteUrl()).host;
  } catch {
    return SITE_CANONICAL_HOST;
  }
}

export function absoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function isProductionDeployment() {
  return process.env.VERCEL_ENV === "production";
}

export function getConfiguredSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    ""
  );
}

type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  noIndex?: boolean;
  ogImage?: string;
};

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const description = input.description || SITE_DEFAULT_DESCRIPTION;
  const canonical = absoluteUrl(input.path);
  const ogImage = input.ogImage || absoluteUrl("/logo-shield.png");

  return {
    title: input.title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "pl_PL",
      url: canonical,
      siteName: APP_NAME,
      title: input.title,
      description,
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: `${CLUB_NAME} — logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [ogImage],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function createRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: APP_NAME,
      template: `%s | ${CLUB_NAME}`,
    },
    description: SITE_DEFAULT_DESCRIPTION,
    applicationName: APP_NAME,
    manifest: "/manifest.json",
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: "website",
      locale: "pl_PL",
      url: siteUrl,
      siteName: APP_NAME,
      title: APP_NAME,
      description: SITE_DEFAULT_DESCRIPTION,
      images: [
        {
          url: absoluteUrl("/logo-shield.png"),
          width: 512,
          height: 512,
          alt: `${CLUB_NAME} — logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: APP_NAME,
      description: SITE_DEFAULT_DESCRIPTION,
      images: [absoluteUrl("/logo-shield.png")],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "ZKS Manager",
    },
    icons: {
      icon: [{ url: "/logo-shield.png", type: "image/png" }],
      apple: [{ url: "/logo-shield.png", type: "image/png" }],
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}
