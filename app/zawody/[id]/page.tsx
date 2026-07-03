"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Child {
  id: string;
  imie: string;
  nazwisko: string;
  rokUrodzenia: string;
  plec: string;
  kategoriaWagowa: string;
}

export default function ZgloszenieNaZawodyPage() {
  const params = useParams();

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setChildren([]);
        setLoading(false);
        return;
      }

      await loadChildren(user.uid);
    });

    return () => unsubscribe();
  }, []);

  const loadChildren = async (uid: string) => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "children"),
        where("parentUid", "==", uid)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Child, "id">),
      }));

      setChildren(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const registerChild = async (child: Child) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Musisz być zalogowany.");
        return;
      }

      const userSnapshot = await getDocs(
        query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        )
      );

      let parentPhone = "";

      if (!userSnapshot.empty) {
        parentPhone =
          userSnapshot.docs[0].data().telefon || "";
      }

      await addDoc(collection(db, "registrations"), {
        eventId: String(params.id),

        childId: child.id,
        childName: child.imie,
        childSurname: child.nazwisko,
        childBirthYear: child.rokUrodzenia,
        childGender: child.plec,
        childWeight: child.kategoriaWagowa,

        parentUid: user.uid,
        parentPhone,

        status: "pending",
        createdAt: new Date(),
      });

      // wysłanie SMS
      if (parentPhone) {
        await fetch("/api/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: parentPhone,
            message:
              "Test SMS z systemu ZKS Białogard. Zgłoszenie zostało zapisane.",
          }),
        });
      }

      alert("Dziecko zostało zgłoszone na zawody.");
    } catch (error) {
      console.error(error);
      alert("Błąd podczas zgłoszenia.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-yellow-400 mb-8">
          Zgłoszenie na zawody
        </h1>

        <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6 mb-8">
          <p className="text-gray-300">ID zawodów:</p>

          <p className="text-yellow-400 font-bold mt-2">
            {String(params.id)}
          </p>
        </div>

        {loading ? (
          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6">
            Ładowanie dzieci...
          </div>
        ) : children.length === 0 ? (
          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6">
            Nie masz jeszcze dodanych dzieci.
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

                <p className="mt-3">
                  Rok urodzenia: {child.rokUrodzenia}
                </p>

                <p>
                  Płeć: {child.plec}
                </p>

                <p>
                  Kategoria wagowa: {child.kategoriaWagowa} kg
                </p>

                <button
                  onClick={() => registerChild(child)}
                  className="mt-5 bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
                >
                  Zgłoś na zawody
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}