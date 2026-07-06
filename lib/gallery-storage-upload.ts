import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { storage } from "./firebase";

const UPLOAD_TIMEOUT_MS = 90_000;

export async function uploadGalleryFile(file: File, path: string) {
  const storageRef = ref(storage, path);

  await new Promise<void>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "image/jpeg",
      cacheControl: "public,max-age=31536000",
    });

    const timer = window.setTimeout(() => {
      task.cancel();
      reject(
        new Error(
          "Upload trwa zbyt długo — sprawdź internet lub wybierz mniejsze zdjęcie (JPG)."
        )
      );
    }, UPLOAD_TIMEOUT_MS);

    task.on(
      "state_changed",
      () => undefined,
      (error) => {
        window.clearTimeout(timer);
        const code = (error as { code?: string }).code;

        if (code === "storage/unauthorized") {
          reject(new Error("Brak uprawnień do wysyłania zdjęć. Zaloguj się ponownie jako admin."));
          return;
        }

        reject(
          error instanceof Error
            ? error
            : new Error("Nie udało się wysłać pliku do magazynu zdjęć.")
        );
      },
      () => {
        window.clearTimeout(timer);
        resolve();
      }
    );
  });

  return getDownloadURL(storageRef);
}
