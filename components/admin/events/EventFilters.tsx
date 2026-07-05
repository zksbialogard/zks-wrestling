"use client";

import { Search } from "lucide-react";

export default function EventFilters() {
  return (
    <div className="mb-8 rounded-3xl border border-yellow-500/20 bg-zinc-900 p-6">

      <div className="grid gap-4 lg:grid-cols-4">

        {/* Szukaj */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            placeholder="Szukaj zawodów..."
            className="
              w-full
              rounded-xl
              border
              border-zinc-700
              bg-zinc-950
              py-3
              pl-11
              pr-4
              text-white
              outline-none
              transition
              focus:border-yellow-500
            "
          />

        </div>

        {/* Status */}

        <select className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white">

          <option>Wszystkie statusy</option>

          <option>Zapisy otwarte</option>

          <option>Zapisy zamknięte</option>

          <option>Zakończone</option>

        </select>

        {/* Miasto */}

        <input
          placeholder="Miasto"
          className="
            rounded-xl
            border
            border-zinc-700
            bg-zinc-950
            px-4
            text-white
            outline-none
            focus:border-yellow-500
          "
        />

        {/* Data */}

        <input
          type="date"
          className="
            rounded-xl
            border
            border-zinc-700
            bg-zinc-950
            px-4
            text-white
            outline-none
            focus:border-yellow-500
          "
        />

      </div>

    </div>
  );
}