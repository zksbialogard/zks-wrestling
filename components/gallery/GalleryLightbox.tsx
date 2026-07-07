"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { GalleryItem } from "@/lib/gallery-types";

type GalleryLightboxProps = {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export default function GalleryLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const item = items[index];

  const goPrev = useCallback(() => {
    if (index > 0) {
      onNavigate(index - 1);
    }
  }, [index, onNavigate]);

  const goNext = useCallback(() => {
    if (index < items.length - 1) {
      onNavigate(index + 1);
    }
  }, [index, items.length, onNavigate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        goPrev();
      } else if (event.key === "ArrowRight") {
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, onClose]);

  if (!item) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;

        if (startX == null || endX == null) {
          return;
        }

        const delta = endX - startX;

        if (Math.abs(delta) > 50) {
          if (delta > 0) {
            goPrev();
          } else {
            goNext();
          }
        }

        touchStartX.current = null;
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
        aria-label="Zamknij"
      >
        <X className="h-5 w-5" />
      </button>

      {index > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10 sm:left-4"
          aria-label="Poprzednie zdjęcie"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {index < items.length - 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10 sm:right-4"
          aria-label="Następne zdjęcie"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div
        className="relative flex max-h-[85vh] w-full max-w-5xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-[70vh] w-full max-w-4xl">
          <Image
            src={item.url}
            alt={item.title}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>

        <div className="mt-4 w-full max-w-4xl text-center">
          <p className="text-lg font-semibold text-white">{item.title}</p>
          <p className="mt-1 text-sm text-zks-text-muted">
            {index + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>
  );
}
