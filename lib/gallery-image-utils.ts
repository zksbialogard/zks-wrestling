export type PreparedGalleryImages = {
  full: File;
  thumb: File;
  originalBytes: number;
  fullBytes: number;
  thumbBytes: number;
};

type ResizeOptions = {
  maxEdge: number;
  quality: number;
  label: "full" | "thumb";
};

function baseNameFromFile(file: File) {
  return file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "-") || "photo";
}

async function resizeToJpeg(
  bitmap: ImageBitmap,
  baseName: string,
  options: ResizeOptions
): Promise<File> {
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > options.maxEdge ? options.maxEdge / longest : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Przeglądarka nie obsługuje optymalizacji zdjęć.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", options.quality);
  });

  if (!blob) {
    throw new Error("Nie udało się skompresować zdjęcia.");
  }

  return new File([blob], `${baseName}-${options.label}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/** Pełne zdjęcie + miniatura — szybszy upload i ładowanie kafelków. */
export async function prepareGalleryImages(file: File): Promise<PreparedGalleryImages> {
  if (!file.type.startsWith("image/")) {
    return {
      full: file,
      thumb: file,
      originalBytes: file.size,
      fullBytes: file.size,
      thumbBytes: file.size,
    };
  }

  const bitmap = await createImageBitmap(file);
  const baseName = baseNameFromFile(file);

  try {
    const [full, thumb] = await Promise.all([
      resizeToJpeg(bitmap, baseName, { maxEdge: 1600, quality: 0.84, label: "full" }),
      resizeToJpeg(bitmap, baseName, { maxEdge: 640, quality: 0.78, label: "thumb" }),
    ]);

    return {
      full,
      thumb,
      originalBytes: file.size,
      fullBytes: full.size,
      thumbBytes: thumb.size,
    };
  } finally {
    bitmap.close();
  }
}

/** @deprecated Użyj prepareGalleryImages */
export async function compressImageForUpload(file: File): Promise<File> {
  const prepared = await prepareGalleryImages(file);
  return prepared.full;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCompressionSummary(prepared: PreparedGalleryImages) {
  const saved = prepared.originalBytes - prepared.fullBytes - prepared.thumbBytes;
  const savedPercent =
    prepared.originalBytes > 0
      ? Math.round((saved / prepared.originalBytes) * 100)
      : 0;

  if (saved <= 0) {
    return `Pełne: ${formatBytes(prepared.fullBytes)}, miniatura: ${formatBytes(prepared.thumbBytes)}`;
  }

  return `Z ${formatBytes(prepared.originalBytes)} → ${formatBytes(prepared.fullBytes)} + miniatura ${formatBytes(prepared.thumbBytes)} (−${savedPercent}%)`;
}
