import { getNews } from "@/lib/news";
import { createPageMetadata } from "@/lib/site-config";

import NewsImagesGallery from "@/components/news/NewsImagesGallery";
import { PublicPageShell, PublicPageStack } from "@/components/layout/PublicPageShell";

export const metadata = createPageMetadata({
  title: "Aktualności klubu",
  description:
    "Komunikaty ZKS Białogard — informacje o treningach, zawodach, obozach i wydarzeniach klubowych.",
  path: "/aktualnosci",
});

export const dynamic = "force-dynamic";

export default async function AktualnosciPage() {
  const news = await getNews({ fresh: true });

  return (
    <PublicPageShell
      title="Aktualności"
      description="Komunikaty, informacje o treningach, zawodach i wydarzeniach klubowych."
      maxWidth="max-w-5xl"
    >
      {news.length === 0 ? (
        <div className="zks-card zks-card-pad text-center text-zks-text-muted">
          Brak aktualności.
        </div>
      ) : (
        <PublicPageStack>
          {news.map((item) => (
            <article key={item.id} className="app-article-card">
              <h2 className="app-article-card-title">{item.title}</h2>
              {item.created_at ? (
                <p className="app-article-card-date">
                  {new Date(item.created_at).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              ) : null}
              <p className="app-article-card-text">{item.content}</p>
              <NewsImagesGallery images={item.images || []} title={item.title} />
            </article>
          ))}
        </PublicPageStack>
      )}
    </PublicPageShell>
  );
}
