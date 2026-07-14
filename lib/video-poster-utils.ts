const POSTER_MAX_EDGE = 1280;
const POSTER_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function scaledSize(width: number, height: number, maxEdge: number) {
  const longest = Math.max(width, height);
  const scale = longest > maxEdge ? maxEdge / longest : 1;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Miniatura z klatki wideo — szybkie ładowanie listy bez pobierania całego pliku. */
export async function captureVideoPoster(file: File): Promise<File> {
  if (!file.type.startsWith("video/")) {
    throw new Error("Wybierz plik wideo (MP4 lub WEBM).");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    await withTimeout(
      new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("Nie udało się odczytać pliku wideo."));
      }),
      POSTER_TIMEOUT_MS,
      "Odczyt wideo trwa zbyt długo."
    );

    const seekTo = Number.isFinite(video.duration)
      ? Math.min(Math.max(video.duration * 0.15, 0.5), 3)
      : 0.5;

    video.currentTime = seekTo;

    await withTimeout(
      new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("Nie udało się wygenerować miniatury."));
      }),
      POSTER_TIMEOUT_MS,
      "Generowanie miniatury trwa zbyt długo."
    );

    const size = scaledSize(video.videoWidth, video.videoHeight, POSTER_MAX_EDGE);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Przeglądarka nie obsługuje miniatur wideo.");
    }

    context.drawImage(video, 0, 0, size.width, size.height);

    const blob = await withTimeout(
      new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.82);
      }),
      10_000,
      "Kompresja miniatury trwa zbyt długo."
    );

    if (!blob) {
      throw new Error("Nie udało się utworzyć miniatury.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "-") || "wideo";

    return new File([blob], `${baseName}-poster.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
