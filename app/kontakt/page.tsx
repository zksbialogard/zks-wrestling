export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full text-center">

        <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-10">
          Kontakt
        </h1>

        <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-10 shadow-[0_0_25px_rgba(255,215,0,0.15)]">

          <h2 className="text-3xl font-bold text-yellow-400 mb-8">
            Trener Woźniak Damian
          </h2>

          <p className="text-xl text-gray-300 mb-8">
            W sprawach treningów, zapisów do klubu oraz zawodów prosimy o kontakt telefoniczny.
          </p>

          <a
            href="tel:+48790335967"
            className="
              inline-flex
              items-center
              gap-3
              bg-yellow-500
              hover:bg-yellow-400
              text-black
              font-bold
              px-8
              py-4
              rounded-2xl
              text-xl
              transition-all
              duration-300
              hover:scale-105
            "
          >
            📞 790 335 967
          </a>

          <p className="mt-8 text-gray-400">
            Kliknij numer telefonu, aby nawiązać połączenie.
          </p>

        </div>

      </div>
    </main>
  );
}