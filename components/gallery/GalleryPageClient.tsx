"use client";

import { useState } from "react";

import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import type { GalleryItem } from "@/lib/gallery-types";

type GalleryPageClientProps = {
  initialItems: GalleryItem[];
};

export default function GalleryPageClient({ initialItems }: GalleryPageClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      {initialItems.length === 0 ? (
        <div className="zks-card mt-8 p-6 text-zks-text-muted">Brak zdjęć w galerii.</div>
      ) : (
        <GalleryGrid
          items={initialItems}
          onItemClick={(index) => setLightboxIndex(index)}
        />
      )}

      {lightboxIndex !== null && (
        <GalleryLightbox
          items={initialItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
