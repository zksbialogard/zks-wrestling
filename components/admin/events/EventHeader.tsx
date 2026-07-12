"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";

import AddEventModal from "./AddEventModal";
import ImportPlan2026Button from "./ImportPlan2026Button";

export default function EventHeader({
  onCreated,
  moderatorMode = false,
}: {
  onCreated?: () => void | Promise<void>;
  moderatorMode?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-5xl font-black text-white">
            Zawody
          </h1>

          <p className="mt-3 text-lg text-zinc-400">
            {moderatorMode
              ? "Dodawaj, edytuj i usuwaj zawody klubowe."
              : "Zarządzaj zawodami, zapisami oraz komunikacją z rodzicami."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          {!moderatorMode ? (
            <ImportPlan2026Button onImported={onCreated} />
          ) : null}

          <button
            onClick={() => setOpen(true)}
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            bg-yellow-500
            px-7
            py-4
            text-lg
            font-bold
            text-black
            transition-all
            duration-300
            hover:scale-105
            hover:shadow-[0_0_30px_rgba(250,204,21,.35)]
          "
        >
          <CalendarPlus size={24} />
          Dodaj zawody
        </button>
        </div>

      </div>

      <AddEventModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={onCreated}
      />
    </>
  );
}