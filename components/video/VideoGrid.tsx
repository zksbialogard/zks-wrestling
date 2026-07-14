"use client";

import Image from "next/image";
import { Play } from "lucide-react";

import type { VideoItem } from "@/lib/video-types";

type Props = {
  items: VideoItem[];
  onItemClick: (index: number) => void;
};

export default function VideoGrid({ items, onItemClick }: Props) {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onItemClick(index)}
            className="group relative block w-full overflow-hidden rounded-xl border border-zks-gold-mid/20 bg-zks-black/40 text-left transition hover:border-zks-gold-mid/45"
          >
            <div className="relative aspect-video">
              <Image
                src={item.posterUrl}
                alt={item.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 384px"
                loading="lazy"
                unoptimized
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zks-gold-mid/50 bg-black/60 text-zks-gold-bright transition group-hover:scale-105 group-hover:bg-zks-gold/20">
                <Play className="ml-1 h-6 w-6 fill-current" />
              </span>
              {item.source === "youtube" && (
                <span className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  YouTube
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white">{item.title}</h3>
              {item.createdAt && (
                <p className="mt-1 text-xs text-zks-text-muted">
                  {new Date(item.createdAt).toLocaleDateString("pl-PL")}
                </p>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
