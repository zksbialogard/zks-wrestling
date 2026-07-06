import { getGalleryItems } from "@/lib/gallery-server";

import GalleryPageClient from "@/components/gallery/GalleryPageClient";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const items = await getGalleryItems();

  return (
    <main className="min-h-screen bg-zks-black px-4 pb-16 pt-28 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold uppercase">
          Galeria
        </h1>
        <p className="mt-2 text-sm text-zks-text-muted">
          Zdjęcia z treningów, zawodów i wydarzeń klubowych.
        </p>

        <GalleryPageClient initialItems={items} />
      </div>
    </main>
  );
}
