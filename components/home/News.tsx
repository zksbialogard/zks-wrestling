type NewsItem = {
  id: string;
  title: string;
  content: string;
};

export default function News({
  aktualnosci,
}: {
  aktualnosci: NewsItem[];
}) {
  return (
    <section className="w-full max-w-5xl px-6 py-10">

      <h2 className="text-3xl md:text-5xl font-bold text-center text-yellow-400 mb-8">
        Aktualności
      </h2>

      {aktualnosci.length === 0 ? (
        <div className="bg-zinc-900/80 border border-yellow-500 rounded-3xl p-8 text-center">
          Brak aktualności.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">

          {aktualnosci.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/80 border border-yellow-500 rounded-3xl p-5 hover:scale-[1.02] transition"
            >
              <h3 className="text-yellow-400 font-bold text-lg mb-2">
                {item.title}
              </h3>

              <p className="text-gray-300">
                {item.content}
              </p>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}