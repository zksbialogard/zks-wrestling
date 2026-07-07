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

function excerpt(text: string, max = 120) {
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
    <section className="home-news-section relative w-full overflow-hidden py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/90 to-black" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zks-gold-mid">
              ZKS Białogard
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold uppercase text-white sm:text-4xl">
              Aktualności
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zks-text-muted">
              Najnowsze informacje z klubu — treningi, zawody i ważne komunikaty.
            </p>
          </div>

          <Link
            href="/aktualnosci"
            className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-xl border border-zks-gold-mid/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zks-gold-bright transition hover:border-zks-gold-mid/50 hover:bg-zks-gold/10 sm:self-auto sm:text-sm"
          >
            Wszystkie aktualności
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {aktualnosci.length === 0 ? (
          <div className="home-news-empty zks-card zks-card-pad text-center">
            <p className="text-zks-text-muted">Brak aktualności.</p>
          </div>
        ) : (
          <div className="home-news-feed">
            {aktualnosci.map((item, index) => {
              const dateLabel = formatNewsDate(item.created_at);

              return (
                <article key={item.id} className="home-news-card group">
                  <div className="home-news-card-accent" aria-hidden />
                  <div className="relative flex h-full flex-col p-5 sm:p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="home-news-card-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {dateLabel ? (
                        <time className="text-[11px] uppercase tracking-wide text-zks-text-muted">
                          {dateLabel}
                        </time>
                      ) : null}
                    </div>

                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase leading-snug text-white transition group-hover:text-zks-gold-bright sm:text-xl">
                      {item.title}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-relaxed text-zks-text-muted">
                      {excerpt(item.content)}
                    </p>

                    <Link
                      href="/aktualnosci"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zks-gold-mid transition group-hover:text-zks-gold-bright"
                    >
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
