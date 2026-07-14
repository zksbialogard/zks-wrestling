import { auth } from "./firebase";

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany z uprawnieniami moderatora lub administratora.");
  }

  const token = await user.getIdToken(true);

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function uploadVideoFileViaApi(video: File, poster: File) {
  const headers = await getAuthHeader();
  const formData = new FormData();
  formData.append("video", video);
  formData.append("poster", poster);

  const response = await fetch("/api/admin/videos/upload", {
    method: "POST",
    headers,
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      (result as { error?: string }).error || "Nie udało się wysłać wideo na serwer."
    );
  }

  return result as {
    ok: true;
    url: string;
    storagePath: string;
    posterUrl: string;
    posterStoragePath: string;
  };
}

export async function deleteVideoFilesViaApi(storagePaths: string[]) {
  const headers = {
    ...(await getAuthHeader()),
    "Content-Type": "application/json",
  };

  const response = await fetch("/api/admin/videos/upload", {
    method: "DELETE",
    headers,
    body: JSON.stringify({ storagePaths }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      (result as { error?: string }).error || "Nie udało się usunąć plików wideo."
    );
  }
}
