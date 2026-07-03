export default function WynikiZawodowPage() {
return ( <main className="min-h-screen bg-black text-white"> <section className="max-w-7xl mx-auto px-6 py-20">

```
    <div className="text-center mb-16">
      <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-6">
        Wyniki zawodów
      </h1>

      <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
        Najnowsze osiągnięcia zawodników ZKS Białogard podczas zawodów
        regionalnych, krajowych i międzynarodowych.
      </p>
    </div>

    <div className="space-y-8">

      <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-8">

        <h2 className="text-3xl font-bold text-yellow-400 mb-4">
          Mistrzostwa Województwa
        </h2>

        <div className="space-y-2 text-gray-300">
          <p>🥇 Jan Kowalski – 1 miejsce</p>
          <p>🥈 Adam Nowak – 2 miejsce</p>
          <p>🥉 Michał Wiśniewski – 3 miejsce</p>
        </div>

      </div>

      <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-8">

        <h2 className="text-3xl font-bold text-yellow-400 mb-4">
          Puchar Polski
        </h2>

        <div className="space-y-2 text-gray-300">
          <p>🥈 Mateusz Zieliński – 2 miejsce</p>
          <p>🥉 Jakub Krawczyk – 3 miejsce</p>
        </div>

      </div>

    </div>

  </section>
</main>
```

);
}
