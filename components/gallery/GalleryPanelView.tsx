import GalleryPageClient from "@/components/gallery/GalleryPageClient";
import { PanelPage, PanelPageHeader } from "@/components/layout/PanelLayout";
import type { GalleryItem } from "@/lib/gallery-types";

type GalleryPanelViewProps = {
  initialItems: GalleryItem[];
};

export default function GalleryPanelView({ initialItems }: GalleryPanelViewProps) {
  return (
    <PanelPage>
      <PanelPageHeader
        title="Galeria"
        description="Zdjęcia z treningów, zawodów i wydarzeń klubowych."
      />
      <GalleryPageClient initialItems={initialItems} />
    </PanelPage>
  );
}
