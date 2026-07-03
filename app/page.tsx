import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getAktualnosci() {
  const { data } = await supabase
    .from("aktualnosci")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4);
  

  return data || [];
}

async function getEvents() {
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .limit(4);

  return data || [];
}

export default async function Home() {
  const aktualnosci = await getAktualnosci();
  const events = await getEvents();

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center">

      {/* HERO */}
      <section className="w-full max-w-5xl px-6 pt-8 pb-12">

        <div className="flex flex-col items-center text-center">

          <Image
            src="/logo.png"
            alt="ZKS Białogard"
            width={180}
            height={180}
            priority
            className="mb-4"
          />

          <h1 className="text-3xl md:text-7xl font-extrabold text-yellow-400 mb-6">
  ZKS Białogard
</h1>

          <p className="max-w-3xl text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
            Klub Zapaśniczy z tradycjami. Szkolenie dzieci,
            młodzieży i seniorów, udział w zawodach krajowych
            oraz rozwój sportowy mieszkańców Białogardu.
          </p>

          {/* STATYSTYKI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mt-4">

            <div className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">
                1500+
              </div>
              <div className="text-sm text-gray-300">
                Medali
              </div>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">
                100+
              </div>
              <div className="text-sm text-gray-300">
                Zawodników
              </div>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">
                6
              </div>
              <div className="text-sm text-gray-300">
                Lat tradycji
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* O KLUBIE */}
      <section className="w-full max-w-5xl px-6 py-10">

        <h2 className="text-3xl md:text-5xl font-bold text-center text-yellow-400 mb-8">
          O klubie
        </h2>

        <div className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500 rounded-3xl p-8 md:p-12">

          <p className="max-w-2xl mx-auto text-center text-base md:text-lg text-gray-300 leading-7">
            ZKS Białogard to klub zapaśniczy szkolący dzieci,
młodzież i seniorów. Naszym celem jest rozwój
sportowy zawodników, promocja aktywności fizycznej
oraz reprezentowanie miasta Białogard na zawodach
regionalnych i ogólnopolskich.
          </p>

        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">

  <Link
    href="/kontakt"
    className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl text-center hover:bg-yellow-400 transition-all duration-300"
  >
    📝 Dołącz do klubu
  </Link>

  <Link
    href="/galeria"
    className="border border-yellow-500 text-yellow-400 font-bold px-6 py-3 rounded-xl text-center hover:bg-yellow-500/20 transition-all duration-300"
  >
    📸 Zobacz galerię
  </Link>

</div>

      </section>

      {/* NAJBLIŻSZE ZAWODY */}
      <section className="w-full max-w-5xl px-6 py-10">

        <h2 className="text-2xl md:text-5xl font-bold text-center text-yellow-400 mb-8">
  Najbliższe zawody
</h2>

        {events.length === 0 ? (
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500 rounded-3xl p-6 text-center">
            Brak zaplanowanych zawodów.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">

            {events.map((event: any) => (
              <div
                key={event.id}
                className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500 rounded-3xl p-6 min-h-[140px] hover:scale-[1.02] transition duration-300"
              >
                <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-2">
                  {event.title}
                </h3>

                <div className="space-y-1 text-sm md:text-base">
                  <p>📅 {event.event_date}</p>
                  <p>📍 {event.location}</p>
                  <p className="text-gray-400">
                    Rejestracja do: {event.registration_deadline}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* AKTUALNOŚCI */}
      <section className="w-full max-w-5xl px-6 py-10">

        <h2 className="text-3xl md:text-5xl font-bold text-center text-yellow-400 mb-6">
          Aktualności
        </h2>

        {aktualnosci.length === 0 ? (
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500 rounded-3xl p-10 text-center">
            Brak aktualności.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">

            {aktualnosci.map((item: any) => (
              <div
                key={item.id}
                className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500 rounded-3xl p-4 min-h-[80px] hover:scale-[1.02]"
              >
                <h3 className="text-base md:text-lg font-bold text-yellow-400 mb-1">
                  {item.title}
                </h3>

                <p className="text-gray-300 leading-6 text-sm">
                  {item.content}
                </p>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* KONTAKT */}
      <section className="w-full max-w-5xl px-6 pt-20 pb-10">

        <h2 className="text-4xl md:text-5xl font-bold text-center text-yellow-400 mb-8">
          Kontakt
        </h2>

      <div className="max-w-5xl mx-auto flex justify-center">

  <div className="w-full md:w-4/5 bg-zinc-900/80 backdrop-blur-sm border border-yellow-500 rounded-3xl p-10 text-center hover:scale-[1.02] transition duration-300">
            <div className="space-y-8">

              <div>
                <div className="text-4xl mb-2">📍</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">
                  Adres
                </h3>
                <p>Grunwaldzka 46</p>
                <p>78-200 Białogard</p>
              </div>

              <div className="border-t border-yellow-500/30 pt-6">
                <div className="text-4xl mb-2">📞</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">
                  Telefon
                </h3>
                <a href="tel:790335967" className="hover:text-yellow-400 transition">
                  790 335 967
                </a>
              </div>

              <div className="border-t border-yellow-500/30 pt-6">
                <div className="text-4xl mb-2">✉️</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">
                  Email
                </h3>
                <a
                  href="mailto:zksbialogard@wp.pl"
                  className="hover:text-yellow-400 transition"
                >
                  zksbialogard@wp.pl
                </a>
              </div>

            </div>

          </div>

        </div>

      </section>

      <footer className="w-full border-t border-yellow-500 py-10 text-center text-gray-400 mt-10">
        © 2026 ZKS Białogard
      </footer>

    </main>
  );
}