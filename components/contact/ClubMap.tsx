import { ExternalLink, MapPin } from "lucide-react";

import { clubContact } from "./contact-content";

export default function ClubMap() {
  return (
    <div className="zks-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-zks-gold-mid/20 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-zks-gold-bright" />
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase text-white">
              Lokalizacja klubu
            </p>
            <p className="truncate text-xs text-zks-text-muted">
              {clubContact.street}, {clubContact.city}
            </p>
          </div>
        </div>

        <a
          href={clubContact.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-zks-gold-bright transition hover:text-zks-gold-highlight"
        >
          Mapy
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zks-black sm:aspect-[16/11]">
        <div className="absolute inset-0 scale-[1.08]">
          <iframe
            title={`Mapa — ${clubContact.name}`}
            src={clubContact.mapsEmbedUrl}
            className="h-full w-full border-0 opacity-90 [filter:invert(1)_hue-rotate(180deg)_brightness(0.82)_contrast(1.15)_saturate(0.65)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zks-black/35 via-transparent to-zks-black/55" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-zks-gold-mid/20" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+8px)]">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-zks-gold/25 blur-md" />
            <MapPin className="relative h-8 w-8 text-zks-gold-bright drop-shadow-[0_0_12px_rgba(247,209,84,0.6)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
