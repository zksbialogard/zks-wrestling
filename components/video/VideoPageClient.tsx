"use client";

import { useState } from "react";

import VideoGrid from "@/components/video/VideoGrid";
import VideoPlayerModal from "@/components/video/VideoPlayerModal";
import type { VideoItem } from "@/lib/video-types";

type Props = {
  initialItems: VideoItem[];
};

export default function VideoPageClient({ initialItems }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      {initialItems.length === 0 ? (
        <div className="zks-card mt-8 p-6 text-zks-text-muted">Brak filmów w sekcji wideo.</div>
      ) : (
        <VideoGrid items={initialItems} onItemClick={setActiveIndex} />
      )}

      {activeIndex !== null && initialItems[activeIndex] && (
        <VideoPlayerModal
          item={initialItems[activeIndex]}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
