"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "@/lib/firebase";

type GalleryItem = {
  id: string;
  title: string;
  url: string;
};

export default function GaleriaPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const snapshot = await getDocs(
        query(collection(db, "gallery"), orderBy("createdAt", "desc"))
      );

      setItems(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<GalleryItem, "id">),
        }))
      );
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-zks-black px-4 pb-16 pt-28 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold uppercase">
          Galeria
        </h1>

        {items.length === 0 ? (
          <div className="zks-card mt-8 p-6 text-zks-text-muted">Brak zdjęć w galerii.</div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="zks-card overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="p-4 text-sm text-zks-text">{item.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
