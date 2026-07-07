import Link from "next/link";
import { ArrowRight } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
};

function formatNewsDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function excerpt(text: string, max = 140) {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }

  return `${trimmed.slice(0, max).trimEnd()}…`;
}

export default function News({
  aktualnosci,
}: {
  aktualnosci: NewsItem[];
}) {
  return (
    <section className="home-news-section relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/90 to-black" />

      <div className="home-news-inner relative mx-auto w-full max-w-6xl">
        <header className="home-news-header">
          <p className="home-news-kicker">ZKS Białogard</p>
          <h2 className="home-news-title">Aktualności</h2>
          <p className="home-news-lead">
            Najnowsze informacje z klubu — treningi, zawody i ważne komunikaty.
          </p>
          <Link href="/aktualnosci" className="home-news-all-link">
            Wszystkie aktualności
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </header>

        {aktualnosci.length === 0 ? (
          <div className="home-news-empty zks-card zks-card-pad text-center">
            <p className="text-zks-text-muted">Brak aktualności.</p>
          </div>
        ) : (
          <div className="home-news-feed">
            {aktualnosci.map((item) => {
              const dateLabel = formatNewsDate(item.created_at);

              return (
                <article key={item.id} className="home-news-card group">
                  <div className="home-news-card-accent" aria-hidden />
                  <div className="home-news-card-body">
                    {dateLabel ? (
                      <time className="home-news-card-date" dateTime={item.created_at}>
                        {dateLabel}
                      </time>
                    ) : (
                      <span className="home-news-card-date">Klub</span>
                    )}

                    <h3 className="home-news-card-title">{item.title}</h3>

                    <p className="home-news-card-text">{excerpt(item.content)}</p>

                    <Link href="/aktualnosci" className="home-news-card-link">
                      Czytaj więcej
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
