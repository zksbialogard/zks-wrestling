"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Child {
  id: string;
  imie: string;
  nazwisko: string;
  rokUrodzenia: string;
  plec: string;
  kategoriaWagowa: string;
  parentUid: string;
}

export default function DzieciPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChildren = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "children")
      );

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Child, "id">),
      }));

      setChildren(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeChild = async (id: string) => {
    if (!confirm("Usunąć dziecko?")) return;

    try {
      await deleteDoc(doc(db, "children", id));
      await loadChildren();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-yellow-400 mb-8">
          Dzieci w klubie
        </h1>

        {loading ? (
          <p>Ładowanie...</p>
        ) : children.length === 0 ? (
          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6">
            Brak dzieci.
          </div>
        ) : (
          <div className="grid gap-6">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6"
              >
                <h2 className="text-2xl font-bold text-yellow-400">
                  {child.imie} {child.nazwisko}
                </h2>

                <p>
                  Rok urodzenia: {child.rokUrodzenia}
                </p>

                <p>
                  Płeć: {child.plec}
                </p>

                <p>
                  Kategoria wagowa: {child.kategoriaWagowa} kg
                </p>

                <p className="text-sm text-gray-500 mt-3 break-all">
                  UID rodzica: {child.parentUid}
                </p>

                <button
                  onClick={() => removeChild(child.id)}
                  className="mt-4 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl font-bold"
                >
                  Usuń dziecko
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}