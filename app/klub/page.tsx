import Image from "next/image";

export default function KlubPage() {
  return (
    <main className="min-h-screen bg-black text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-yellow-400 mb-10">
          O Klubie
        </h1>

        <div className="flex justify-center mb-10">
          <Image
            src="/logo.png"
            alt="ZKS Białogard"
            width={250}
            height={250}
            priority
          />
        </div>

        <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-8 shadow-xl">
          <p className="text-lg text-gray-300 leading-8 mb-6">
            ZKS Białogard to klub zapaśniczy z wieloletnią tradycją,
            wychowujący kolejne pokolenia zawodników oraz promujący sport
            i zdrowy styl życia wśród dzieci, młodzieży i dorosłych.
          </p>

          <p className="text-lg text-gray-300 leading-8 mb-6">
            Klub bierze udział w licznych turniejach krajowych i
            międzynarodowych, zdobywając medale oraz wyróżnienia na
            różnych szczeblach rywalizacji sportowej.
          </p>

          <p className="text-lg text-gray-300 leading-8">
            Treningi prowadzone są przez wykwalifikowaną kadrę trenerską,
            która dba o rozwój sportowy, wychowawczy oraz bezpieczeństwo
            wszystkich zawodników.
          </p>
        </div>
      </div>
    </main>
  );
}