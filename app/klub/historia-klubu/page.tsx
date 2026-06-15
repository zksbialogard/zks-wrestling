export default function HistoriaKlubuPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-10">
          Historia Klubu
        </h1>

        <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-10 shadow-lg">
          <p className="text-lg text-gray-300 leading-8 mb-6">
            ZKS Białogard od wielu lat rozwija tradycje sportów zapaśniczych
            w regionie Pomorza Zachodniego.
          </p>

          <p className="text-lg text-gray-300 leading-8 mb-6">
            Klub wychował wielu zawodników reprezentujących miasto
            podczas zawodów wojewódzkich, ogólnopolskich i
            międzynarodowych.
          </p>

          <p className="text-lg text-gray-300 leading-8">
            Dzięki pracy trenerów i zaangażowaniu zawodników klub stale
            się rozwija, promując zapasy oraz aktywny styl życia.
          </p>
        </div>
      </div>
    </main>
  );
}