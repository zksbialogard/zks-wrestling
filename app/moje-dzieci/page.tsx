"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

interface Child {
  id: string;
  imie: string;
  nazwisko: string;
  rokUrodzenia: string;
  plec: string;
  kategoriaWagowa: string;
}

export default function MojeDzieciPage() {
  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [rokUrodzenia, setRokUrodzenia] = useState("");
  const [plec, setPlec] = useState("M");
  const [kategoriaWagowa, setKategoriaWagowa] = useState("");
  const [dzieci, setDzieci] = useState<Child[]>([]);

  const loadChildren = async () => {
    const user = auth.currentUser;

    if (!user) return;

    const q = query(
      collection(db, "children"),
      where("parentUid", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Child, "id">),
    }));

    setDzieci(data);
  };

  const addChild = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Musisz być zalogowany.");
      return;
    }

    if (
      !imie ||
      !nazwisko ||
      !rokUrodzenia ||
      !kategoriaWagowa
    ) {
      alert("Uzupełnij wszystkie pola.");
      return;
    }

    await addDoc(collection(db, "children"), {
      parentUid: user.uid,
      imie,
      nazwisko,
      rokUrodzenia,
      plec,
      kategoriaWagowa,
      createdAt: new Date(),
    });

    setImie("");
    setNazwisko("");
    setRokUrodzenia("");
    setKategoriaWagowa("");

    await loadChildren();
  };

  const removeChild = async (id: string) => {
    if (!confirm("Usunąć dziecko?")) return;

    await deleteDoc(doc(db, "children", id));

    await loadChildren();
  };

  useEffect(() => {
    loadChildren();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
          Moje dzieci
        </h1>

        <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6 mb-8 space-y-4">

          <input
            type="text"
            placeholder="Imię"
            value={imie}
            onChange={(e) => setImie(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <input
            type="text"
            placeholder="Nazwisko"
            value={nazwisko}
            onChange={(e) => setNazwisko(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <input
            type="number"
            placeholder="Rok urodzenia"
            value={rokUrodzenia}
            onChange={(e) => setRokUrodzenia(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <select
            value={plec}
            onChange={(e) => setPlec(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          >
            <option value="M">Mężczyzna</option>
            <option value="K">Kobieta</option>
          </select>

          <input
            type="text"
            placeholder="Kategoria wagowa (np. 44 kg)"
            value={kategoriaWagowa}
            onChange={(e) => setKategoriaWagowa(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <button
            onClick={addChild}
            className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl"
          >
            Dodaj dziecko
          </button>

        </div>

        <div className="space-y-4">

          {dzieci.map((dziecko) => (
            <div
              key={dziecko.id}
              className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6"
            >
              <h2 className="text-xl text-yellow-400 font-bold">
                {dziecko.imie} {dziecko.nazwisko}
              </h2>

              <p>Rok urodzenia: {dziecko.rokUrodzenia}</p>
              <p>Płeć: {dziecko.plec}</p>
              <p>Kategoria: {dziecko.kategoriaWagowa} kg</p>

              <button
                onClick={() => removeChild(dziecko.id)}
                className="mt-4 bg-red-600 px-4 py-2 rounded-xl"
              >
                Usuń
              </button>
            </div>
          ))}

        </div>

      </div>
    </main>
  );
}