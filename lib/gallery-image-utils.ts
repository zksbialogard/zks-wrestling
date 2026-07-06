export type PreparedGalleryImages = {
  full: File;
  originalBytes: number;
  fullBytes: number;
};

const FULL_MAX_EDGE = 1280;
const OPTIMIZE_TIMEOUT_MS = 45_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function baseNameFromFile(file: File) {
  return file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "-") || "photo";
}

function scaledSize(width: number, height: number, maxEdge: number) {
  const longest = Math.max(width, height);
  const scale = longest > maxEdge ? maxEdge / longest : 1;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function loadImageElement(file: File) {
  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;

    await withTimeout(
      image.decode(),
      OPTIMIZE_TIMEOUT_MS,
      "Nie udało się odczytać zdjęcia. Użyj JPG lub PNG (unikaj HEIC z iPhone — wyślij jako JPG)."
    );

    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error("Plik nie wygląda na poprawne zdjęcie.");
    }

    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function canvasToJpegFile(
  source: CanvasImageSource,
  width: number,
  height: number,
  fileName: string,
  quality: number
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Przeglądarka nie obsługuje optymalizacji zdjęć.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);

  const blob = await withTimeout(
    new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    }),
    15_000,
    "Kompresja zdjęcia trwa zbyt długo — spróbuj mniejszego pliku."
  );

  if (!blob) {
    throw new Error("Nie udało się skompresować zdjęcia.");
  }

  return new File([blob], fileName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/** Pełne zdjęcie + miniatura — szybszy upload i ładowanie kafelków. */
export async function prepareGalleryImages(file: File): Promise<PreparedGalleryImages> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Wybierz plik graficzny (JPG, PNG, WEBP).");
  }

  if (file.size > 25 * 1024 * 1024) {
    throw new Error("Plik jest zbyt duży (max 25 MB). Zmniejsz zdjęcie przed wysłaniem.");
  }

  const image = await loadImageElement(file);
  const baseName = baseNameFromFile(file);
  const fullSize = scaledSize(image.naturalWidth, image.naturalHeight, FULL_MAX_EDGE);

  const full = await canvasToJpegFile(
    image,
    fullSize.width,
    fullSize.height,
    `${baseName}.jpg`,
    0.82
  );

  return {
    full,
    originalBytes: file.size,
    fullBytes: full.size,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCompressionSummary(prepared: PreparedGalleryImages) {
  const saved = prepared.originalBytes - prepared.fullBytes;
  const savedPercent =
    prepared.originalBytes > 0
      ? Math.round((saved / prepared.originalBytes) * 100)
      : 0;

  if (saved <= 0) {
    return formatBytes(prepared.fullBytes);
  }

  return `Z ${formatBytes(prepared.originalBytes)} → ${formatBytes(prepared.fullBytes)} (−${savedPercent}%)`;
}
