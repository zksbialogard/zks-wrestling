import { auth } from "./firebase";

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

export async function registerGalleryPhoto(data: {
  title: string;
  url: string;
  storagePath?: string;
  thumbUrl?: string;
  thumbStoragePath?: string;
  notify?: boolean;
}) {
  const headers = await getAuthHeader();

  const response = await fetch("/api/admin/gallery", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się dodać zdjęcia do galerii.");
  }

  return result as { ok: true; id: string; notifyResult?: unknown };
}

export async function deleteGalleryPhoto(id: string) {
  const headers = await getAuthHeader();

  const response = await fetch("/api/admin/gallery", {
    method: "DELETE",
    headers,
    body: JSON.stringify({ id }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się usunąć zdjęcia z galerii.");
  }

  return true;
}
