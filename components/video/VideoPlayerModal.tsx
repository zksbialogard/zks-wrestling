"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { VideoItem } from "@/lib/video-types";
import { youtubeEmbedUrl } from "@/lib/video-utils";

type Props = {
  item: VideoItem;
  onClose: () => void;
};

export default function VideoPlayerModal({ item, onClose }: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
  }, [item.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-zks-gold-mid/30 bg-zks-black shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg border border-zks-gold-mid/30 bg-black/70 p-2 text-white transition hover:bg-black"
          aria-label="Zamknij odtwarzacz"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-video bg-black">
          {item.source === "youtube" && item.youtubeId ? (
            active ? (
              <iframe
                src={youtubeEmbedUrl(item.youtubeId, true)}
                title={item.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setActive(true)}
                className="group relative h-full w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition group-hover:bg-black/25">
                  <span className="rounded-full border border-zks-gold-mid/50 bg-black/70 px-5 py-3 text-sm font-semibold text-zks-gold-bright">
                    Odtwórz wideo
                  </span>
                </span>
              </button>
            )
          ) : active ? (
            <video
              src={item.url}
              controls
              playsInline
              preload="metadata"
              poster={item.posterUrl}
              className="h-full w-full bg-black"
            />
          ) : (
            <button
              type="button"
              onClick={() => setActive(true)}
              className="group relative h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.posterUrl}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition group-hover:bg-black/25">
                <span className="rounded-full border border-zks-gold-mid/50 bg-black/70 px-5 py-3 text-sm font-semibold text-zks-gold-bright">
                  Załaduj i odtwórz
                </span>
              </span>
            </button>
          )}
        </div>

        <div className="border-t border-zks-gold-mid/15 px-5 py-4">
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
            {item.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
