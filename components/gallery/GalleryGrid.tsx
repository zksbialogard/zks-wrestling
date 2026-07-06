"use client";

import { useState } from "react";
import Image from "next/image";

import type { GalleryItem } from "@/lib/gallery-types";

type GalleryGridProps = {
  items: GalleryItem[];
  onItemClick: (index: number) => void;
};

function GalleryTile({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square overflow-hidden rounded-xl border border-zks-gold-mid/20 bg-zks-black text-left transition hover:border-zks-gold-mid/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zks-gold"
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-zks-gold-mid/10" />
      )}

      <Image
        src={item.url}
        alt={item.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover transition duration-300 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        unoptimized
        onLoad={() => setLoaded(true)}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <p className="truncate text-sm font-medium text-white">{item.title}</p>
      </div>
    </button>
  );
}

export default function GalleryGrid({ items, onItemClick }: GalleryGridProps) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item, index) => (
        <GalleryTile key={item.id} item={item} onClick={() => onItemClick(index)} />
      ))}
    </div>
  );
}
