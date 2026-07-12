import { auth } from "./firebase";
import type { UserRole } from "./user-roles";

export async function updateUserRoleAsAdmin(userDocId: string, rola: UserRole) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Brak aktywnej sesji administratora.");
  }

  const token = await user.getIdToken();

  const response = await fetch(`/api/admin/users/${encodeURIComponent(userDocId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rola }),
  });

  const data = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Nie udało się zmienić roli.");
  }
}
