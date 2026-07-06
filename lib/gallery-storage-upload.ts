import { auth } from "./firebase";

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany jako administrator.");
  }

  const token = await user.getIdToken(true);

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function uploadGalleryFileViaApi(file: File) {
  const headers = await getAuthHeader();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/gallery/upload", {
    method: "POST",
    headers,
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      (result as { error?: string }).error || "Nie udało się wysłać zdjęcia na serwer."
    );
  }

  return result as { ok: true; url: string; storagePath: string };
}

export async function deleteGalleryFileViaApi(storagePath: string) {
  const headers = {
    ...(await getAuthHeader()),
    "Content-Type": "application/json",
  };

  const response = await fetch("/api/admin/gallery/upload", {
    method: "DELETE",
    headers,
    body: JSON.stringify({ storagePath }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      (result as { error?: string }).error || "Nie udało się usunąć pliku zdjęcia."
    );
  }
}
