export type NewsImage = {
  url: string;
  storagePath?: string;
};

export function normalizeNewsImages(value: unknown): NewsImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string" && item.trim()) {
        return { url: item.trim() };
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const url = typeof record.url === "string" ? record.url.trim() : "";

        if (!url) {
          return null;
        }

        const storagePath =
          typeof record.storagePath === "string" ? record.storagePath.trim() : undefined;

        return { url, storagePath: storagePath || undefined };
      }

      return null;
    })
    .filter((item): item is NewsImage => Boolean(item?.url));
}

export async function deleteNewsImagesFromStorage(images: NewsImage[]) {
  const { deleteGalleryImageFromSupabase } = await import("./gallery-supabase-storage");

  for (const image of images) {
    if (image.storagePath?.startsWith("gallery/")) {
      await deleteGalleryImageFromSupabase(image.storagePath);
    }
  }
}
