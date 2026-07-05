"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AuthField from "@/components/auth/AuthField";
import {
  createNews,
  deleteNews,
  getNews,
  updateNews,
  type NewsItem,
} from "@/lib/news";

export default function AdminAktualnosciPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadNews = async () => {
    setLoading(true);
    const data = await getNews();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  const saveNews = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !content) {
      toast.error("Uzupełnij tytuł i treść.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await updateNews(editingId, { title, content });
        toast.success("Aktualność zaktualizowana.");
      } else {
        await createNews({ title, content });
        toast.success("Aktualność dodana.");
      }

      resetForm();
      await loadNews();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się zapisać aktualności.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
  };

  const removeNews = async (id: string) => {
    if (!confirm("Usunąć tę aktualność?")) return;

    try {
      await deleteNews(id);
      toast.success("Aktualność usunięta.");
      if (editingId === id) resetForm();
      await loadNews();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się usunąć aktualności.";
      toast.error(message);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Aktualności"
        description="Dodawaj, edytuj i usuwaj komunikaty widoczne dla rodziców i na stronie klubu."
      />

      <form onSubmit={saveNews} className="zks-card mb-8 space-y-4 p-6">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
          {editingId ? "Edytuj aktualność" : "Nowa aktualność"}
        </h2>

        <AuthField
          label="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Np. Obóz letni 2026"
        />

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Treść
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Treść aktualności..."
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none focus:border-zks-gold-mid"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingId ? "Zapisz zmiany" : "Opublikuj"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} className="zks-btn-outline px-6 py-2.5 text-sm">
              Anuluj edycję
            </button>
          )}
        </div>
      </form>

      <h2 className="mb-4 font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
        Opublikowane ({news.length})
      </h2>

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie...</p>
      ) : news.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">Brak aktualności.</div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <article key={item.id} className="zks-card p-6">
              <h3 className="text-xl font-bold text-zks-gold-bright">{item.title}</h3>
              {item.created_at && (
                <p className="mt-1 text-xs text-zks-text-muted">
                  {new Date(item.created_at).toLocaleDateString("pl-PL")}
                </p>
              )}
              <p className="mt-4 whitespace-pre-wrap text-sm text-zks-text">{item.content}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="zks-btn-outline px-4 py-2 text-xs"
                >
                  Edytuj
                </button>
                <button
                  type="button"
                  onClick={() => removeNews(item.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Usuń
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
