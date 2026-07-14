import { getVideoItems } from "@/lib/video-server";
import { createPageMetadata } from "@/lib/site-config";

import VideoPageClient from "@/components/video/VideoPageClient";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

export const metadata = createPageMetadata({
  title: "Wideo klubowe",
  description:
    "Filmy z treningów, zawodów i wydarzeń ZKS Białogard — oficjalna sekcja wideo klubu.",
  path: "/wideo",
});

export const dynamic = "force-dynamic";

export default async function WideoPage() {
  const items = await getVideoItems();

  return (
    <PublicPageShell
      title="Wideo"
      description="Filmy z treningów, zawodów i wydarzeń klubowych. Miniatura ładuje się od razu — pełne wideo dopiero po kliknięciu."
    >
      <VideoPageClient initialItems={items} />
    </PublicPageShell>
  );
}
