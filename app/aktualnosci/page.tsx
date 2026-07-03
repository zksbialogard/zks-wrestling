"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  createdAt?: any;
}

export default function AktualnosciPage() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const loadNews = async () => {
      const snapshot = await getDocs(collection(db, "news"));

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<NewsItem, "id">),
      }));

      data.sort((a: any, b: any) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;

        return bTime - aTime;
      });

      setNews(data);
    };

    loadNews();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-yellow-400 mb-10">
          Aktualności
        </h1>

        <div className="space-y-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6"
            >
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                {item.title}
              </h2>

              {item.createdAt?.seconds && (
                <p className="text-gray-500 mb-4">
                  {new Date(
                    item.createdAt.seconds * 1000
                  ).toLocaleDateString("pl-PL")}
                </p>
              )}

              <p className="text-gray-300 whitespace-pre-wrap">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}