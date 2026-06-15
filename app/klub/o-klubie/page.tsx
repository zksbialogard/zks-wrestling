export default function OKlubiePage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-10">
          O Klubie
        </h1>

        <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-10">
          <p className="text-lg text-gray-300 leading-8 mb-6">
            ZKS Białogard to klub sportowy specjalizujący się w zapasach.
          </p>

          <p className="text-lg text-gray-300 leading-8 mb-6">
            Klub prowadzi szkolenie dzieci, młodzieży i dorosłych oraz
            reprezentuje miasto Białogard podczas zawodów regionalnych
            i ogólnopolskich.
          </p>

          <p className="text-lg text-gray-300 leading-8">
            Dzięki zaangażowaniu trenerów, zawodników i rodziców klub
            od wielu lat rozwija zapaśników i promuje sport w regionie.
          </p>
        </div>
      </div>
    </main>
  );
}