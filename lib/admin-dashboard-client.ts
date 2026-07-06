import { auth } from "./firebase";
import type { AdminDashboardStats } from "./admin-dashboard";

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany jako administrator.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchAdminDashboardStats() {
  const headers = await getAuthHeader();
  const response = await fetch("/api/admin/dashboard", { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się pobrać statystyk dashboardu.");
  }

  return result.stats as AdminDashboardStats;
}
