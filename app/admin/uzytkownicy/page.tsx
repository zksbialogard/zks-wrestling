"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserItem {
  id: string;
  uid?: string;
  email?: string;
  imie?: string;
  nazwisko?: string;
  telefon?: string;
  rola?: string;
  createdAt?: any;
}

export default function UzytkownicyPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(
        collection(db, "users")
      );

      const data: UserItem[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<UserItem, "id">),
      }));

      setUsers(data);
    } catch (error) {
      console.error(
        "Błąd pobierania użytkowników:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (id: string) => {
    const confirmDelete = confirm(
      "Czy na pewno chcesz usunąć użytkownika?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", id));
      await loadUsers();
    } catch (error) {
      console.error(
        "Błąd usuwania użytkownika:",
        error
      );
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const phrase = search.toLowerCase();

    return (
      user.imie?.toLowerCase().includes(phrase) ||
      user.nazwisko?.toLowerCase().includes(phrase) ||
      user.email?.toLowerCase().includes(phrase)
    );
  });

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "text-red-400";

      case "moderator":
        return "text-blue-400";

      case "trener":
        return "text-green-400";

      default:
        return "text-yellow-400";
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-yellow-400">
            Użytkownicy ({users.length})
          </h1>

          <button
            onClick={loadUsers}
            className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold"
          >
            Odśwież
          </button>
        </div>

        <input
          type="text"
          placeholder="Szukaj użytkownika..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full mb-8 p-4 rounded-xl bg-zinc-900 border border-yellow-500"
        />

        {loading ? (
          <div className="text-center">
            Ładowanie użytkowników...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6">
            Nie znaleziono użytkowników.
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6"
              >
                <h2 className="text-2xl font-bold text-yellow-400">
                  {user.imie || "Brak"}{" "}
                  {user.nazwisko || "danych"}
                </h2>

                <p className="mt-3">
                  📧 {user.email || "-"}
                </p>

                <p>
                  📱 {user.telefon || "-"}
                </p>

                <p
                  className={`font-bold mt-2 ${getRoleColor(
                    user.rola
                  )}`}
                >
                  Rola: {user.rola || "rodzic"}
                </p>

                {user.uid && (
                  <p className="text-xs text-gray-500 mt-3 break-all">
                    UID: {user.uid}
                  </p>
                )}

                <button
                  onClick={() =>
                    removeUser(user.id)
                  }
                  className="mt-5 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl font-bold transition"
                >
                  Usuń użytkownika
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}