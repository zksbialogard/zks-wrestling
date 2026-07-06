import GalleryPanelView from "@/components/gallery/GalleryPanelView";
import { getGalleryItems } from "@/lib/gallery-server";

export const dynamic = "force-dynamic";

export default async function AthleteGalleryPage() {
  const items = await getGalleryItems();

  return <GalleryPanelView initialItems={items} />;
}
