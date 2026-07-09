import { getGalleryItems } from "@/lib/gallery-server";
import { createPageMetadata } from "@/lib/site-config";

import GalleryPageClient from "@/components/gallery/GalleryPageClient";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

export const metadata = createPageMetadata({
  title: "Galeria klubowa",
  description:
    "Zdjęcia z treningów, zawodów i wydarzeń ZKS Białogard — oficjalna galeria klubu.",
  path: "/galeria",
});

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const items = await getGalleryItems();

  return (
    <PublicPageShell
      title="Galeria"
      description="Zdjęcia z treningów, zawodów i wydarzeń klubowych."
    >
      <GalleryPageClient initialItems={items} />
    </PublicPageShell>
  );
}
