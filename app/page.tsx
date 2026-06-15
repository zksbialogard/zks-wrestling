import Image from "next/image";
import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">

      {/* HERO */}
      <section className="relative py-20 text-center overflow-hidden">

        {/* Logo w tle */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <Image
            src="/logo.png"
            alt="ZKS Białogard"
            width={900}
            height={900}
            priority
            className="
              opacity-10
              object-contain
              w-[90vw]
              max-w-[900px]
              h-auto
            "
          />
        </div>

        {/* Zawartość */}
        <div className="relative z-10">

          <Image
            src="/logo.png"
            alt="Logo ZKS Białogard"
            width={140}
            height={140}
            className="mx-auto mb-6"
          />

          <h1 className="text-5xl md:text-8xl font-extrabold text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
            ZKS Białogard
          </h1>

          <p className="text-lg md:text-2xl text-yellow-200 mt-4">
            Zapasy • Trening • Rywalizacja
          </p>

        </div>

      </section>

      {/* ZAWODY */}
      <section className="max-w-5xl mx-auto px-6 pb-20">

        <h2 className="text-4xl font-bold text-yellow-400 text-center mb-10">
          Najbliższe zawody
        </h2>

        <div className="space-y-10">

          {events?.map((event) => (
            <div
              key={event.id}
              className="
                bg-zinc-900
                border
                border-yellow-500
                rounded-3xl
                p-8
                shadow-[0_0_20px_rgba(255,215,0,0.15)]
                hover:shadow-[0_0_40px_rgba(255,215,0,0.35)]
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">
                {event.title}
              </h3>

              <div className="space-y-4 text-lg text-gray-200">

                <p>
                  📅 <span className="font-semibold">Data zawodów:</span>{" "}
                  {event.event_date}
                </p>

                <p>
                  📍 <span className="font-semibold">Miejsce:</span>{" "}
                  {event.location}
                </p>

                <p>
                  ⏳ <span className="font-semibold">Termin zgłoszeń:</span>{" "}
                  {event.registration_deadline}
                </p>

              </div>

              <button
                className="
                  mt-8
                  bg-yellow-500
                  hover:bg-yellow-400
                  text-black
                  font-bold
                  px-8
                  py-3
                  rounded-xl
                  shadow-lg
                  transition-all
                  duration-300
                  hover:scale-105
                "
              >
                Zapisz zawodnika
              </button>
            </div>
          ))}

        </div>

      </section>

    </main>
  );
}