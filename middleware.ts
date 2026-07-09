import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getConfiguredSiteUrl } from "@/lib/site-config";

export function middleware(request: NextRequest) {
  const configuredSiteUrl = getConfiguredSiteUrl();

  if (!configuredSiteUrl || process.env.VERCEL_ENV !== "production") {
    return NextResponse.next();
  }

  let canonicalHost: string;

  try {
    canonicalHost = new URL(configuredSiteUrl).host.toLowerCase();
  } catch {
    return NextResponse.next();
  }

  const requestHost = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (!requestHost || requestHost === canonicalHost) {
    return NextResponse.next();
  }

  const isLegacyVercelHost = requestHost.endsWith(".vercel.app");

  if (!isLegacyVercelHost) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.protocol = "https:";
  redirectUrl.host = canonicalHost;

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|worker-|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff2?|txt|xml)$).*)",
  ],
};
