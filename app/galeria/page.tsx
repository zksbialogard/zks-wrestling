export default function GaleriaPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 text-center mb-12">
          Galeria
        </h1>

        <p className="text-center text-gray-300 text-lg mb-12">
          Zdjęcia z treningów, zawodów oraz wydarzeń organizowanych przez ZKS Białogard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl h-72 flex items-center justify-center">
            <span className="text-gray-400 text-xl">
              Zdjęcie 1
            </span>
          </div>

          <div className="border border-yellow-500 rounded-3xl h-72 flex items-center justify-center">
            <span className="text-gray-400 text-xl">
              Zdjęcie 2
            </span>
          </div>

          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl h-72 flex items-center justify-center">
            <span className="text-gray-400 text-xl">
              Zdjęcie 3
            </span>
          </div>

          <div className="bg-zigit --versionnc-900 border border-yellow-500 rounded-3xl h-72 flex items-center justify-center">
            <span className="text-gray-400 text-xl">
              Zdjęcie 4
            </span>
          </div>

          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl h-72 flex items-center justify-center">
            <span className="text-gray-400 text-xl">
              Zdjęcie 5
            </span>
          </div>

          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl h-72 flex items-center justify-center">
            <span className="text-gray-400 text-xl">
              Zdjęcie 6
            </span>
          </div>

        </div>

      </div>
    </main>
  );
}