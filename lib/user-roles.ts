export const USER_ROLES = [
  "gosc",
  "rodzic",
  "zawodnik",
  "trener",
  "moderator",
  "admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  gosc: "Gość",
  rodzic: "Rodzic",
  zawodnik: "Zawodnik",
  trener: "Trener",
  moderator: "Moderator",
  admin: "Administrator",
};

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function getRoleLabel(rola?: string): string {
  if (!rola) {
    return ROLE_LABELS.rodzic;
  }

  if (isUserRole(rola)) {
    return ROLE_LABELS[rola];
  }

  return rola;
}

export function isGuestRole(rola?: string): boolean {
  return rola === "gosc";
}

export function canAccessPanel(rola?: string): boolean {
  return (
    rola === "admin" ||
    rola === "rodzic" ||
    rola === "zawodnik" ||
    rola === "trener" ||
    rola === "moderator"
  );
}

export function isAdminRole(rola?: string): boolean {
  return rola === "admin";
}

export function isModeratorRole(rola?: string): boolean {
  return rola === "moderator";
}

export function isStaffRole(rola?: string): boolean {
  return rola === "admin" || rola === "moderator";
}

export function canModerateContent(rola?: string): boolean {
  return isStaffRole(rola);
}
