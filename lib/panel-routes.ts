export function getPanelHref(rola?: string): string {
  if (rola === "admin") {
    return "/admin";
  }

  if (rola === "zawodnik") {
    return "/panel-zawodnika";
  }

  return "/panel-rodzica";
}

export function getPanelLabel(rola?: string): string {
  if (rola === "admin") {
    return "Panel admina";
  }

  if (rola === "zawodnik") {
    return "Panel zawodnika";
  }

  return "Panel rodzica";
}
