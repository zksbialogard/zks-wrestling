import { getNews } from "@/lib/news";

export default async function AktualnosciPage() {
  const news = await getNews();

  return (
    <main className="min-h-screen bg-zks-black px-4 pb-16 pt-28 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold uppercase text-white">
          Aktualności
        </h1>

        <div className="mt-8 space-y-4">
          {news.length === 0 ? (
            <div className="zks-card p-6 text-zks-text-muted">Brak aktualności.</div>
          ) : (
            news.map((item) => (
              <article key={item.id} className="zks-card p-6">
                <h2 className="text-2xl font-bold text-zks-gold-bright">{item.title}</h2>
                {item.created_at && (
                  <p className="mt-1 text-xs text-zks-text-muted">
                    {new Date(item.created_at).toLocaleDateString("pl-PL")}
                  </p>
                )}
                <p className="mt-4 whitespace-pre-wrap text-zks-text">{item.content}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
