import { canAccessPanel, isGuestRole } from "./user-roles";

export function hasParentPanelAccess(rola?: string): boolean {
  return rola === "rodzic" || rola === "trener" || rola === "moderator";
}

export function hasModeratorPanelAccess(rola?: string): boolean {
  return rola === "moderator";
}

export function getPanelHref(rola?: string): string {
  if (isGuestRole(rola) || !canAccessPanel(rola)) {
    return "/";
  }

  if (rola === "admin") {
    return "/admin";
  }

  if (rola === "moderator") {
    return "/moderator";
  }

  if (rola === "zawodnik") {
    return "/panel-zawodnika";
  }

  return "/panel-rodzica";
}

export function getPanelLabel(rola?: string): string {
  if (isGuestRole(rola)) {
    return "Tryb gościa";
  }

  if (rola === "admin") {
    return "Panel admina";
  }

  if (rola === "zawodnik") {
    return "Panel zawodnika";
  }

  if (rola === "trener") {
    return "Panel trenera";
  }

  if (rola === "moderator") {
    return "Panel moderatora";
  }

  return "Panel rodzica";
}

export function getPanelButtonLabel(rola?: string): string {
  if (rola === "moderator") {
    return "Szybki dostęp";
  }

  return "Mój Panel";
}

export function isProtectedPanelPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/moderator") ||
    pathname.startsWith("/panel-rodzica") ||
    pathname.startsWith("/panel-zawodnika") ||
    pathname.startsWith("/moje-dzieci")
  );
}

export function isPanelPathAllowedForRole(pathname: string, rola?: string): boolean {
  if (!rola) {
    return false;
  }

  if (pathname.startsWith("/admin")) {
    return rola === "admin";
  }

  if (pathname.startsWith("/moderator")) {
    return rola === "moderator";
  }

  if (pathname.startsWith("/panel-zawodnika")) {
    return rola === "zawodnik";
  }

  if (pathname.startsWith("/panel-rodzica") || pathname.startsWith("/moje-dzieci")) {
    return hasParentPanelAccess(rola);
  }

  return true;
}
