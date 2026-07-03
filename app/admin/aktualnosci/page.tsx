"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  createdAt?: any;
}

export default function AktualnosciPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);

  const loadNews = async () => {
    try {
      const snapshot = await getDocs(collection(db, "news"));

      const data: NewsItem[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<NewsItem, "id">),
      }));

      data.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setNews(data);
    } catch (error) {
      console.error("Błąd pobierania aktualności:", error);
    }
  };

  const addNews = async () => {
    if (!title || !content) {
      alert("Uzupełnij wszystkie pola");
      return;
    }

    try {
      await addDoc(collection(db, "news"), {
        title,
        content,
        createdAt: new Date(),
      });

      setTitle("");
      setContent("");

      await loadNews();

      alert("Aktualność została dodana");
    } catch (error) {
      console.error(error);
      alert("Błąd podczas zapisu");
    }
  };

  const removeNews = async (id: string) => {
    const confirmDelete = confirm(
      "Czy na pewno chcesz usunąć tę aktualność?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "news", id));
      await loadNews();
    } catch (error) {
      console.error("Błąd usuwania:", error);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8">
          Aktualności
        </h1>

        <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6 mb-8">
          <input
            placeholder="Tytuł aktualności"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 mb-4 rounded-xl bg-black border border-yellow-500 outline-none"
          />

          <textarea
            placeholder="Treść aktualności"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500 outline-none"
          />

          <button
            onClick={addNews}
            className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition"
          >
            Dodaj aktualność
          </button>
        </div>

        <h2 className="text-3xl font-bold text-yellow-400 mb-4">
          Opublikowane aktualności
        </h2>

        {news.length === 0 ? (
          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6 text-gray-400">
            Brak opublikowanych aktualności.
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6"
              >
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                  {item.title}
                </h3>

                {item.createdAt?.seconds && (
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(
                      item.createdAt.seconds * 1000
                    ).toLocaleDateString("pl-PL")}
                  </p>
                )}

                <p className="text-gray-300 whitespace-pre-wrap">
                  {item.content}
                </p>

                <button
                  onClick={() => removeNews(item.id)}
                  className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold transition"
                >
                  Usuń aktualność
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}