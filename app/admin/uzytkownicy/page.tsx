"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { RefreshCw, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { db } from "@/lib/firebase";

interface UserItem {
  id: string;
  uid?: string;
  email?: string;
  imie?: string;
  nazwisko?: string;
  telefon?: string;
  rola?: string;
}

const roles = ["rodzic", "trener", "moderator", "admin"];

export default function AdminUzytkownicyPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<UserItem, "id">),
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się wczytać użytkowników.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (id: string, rola: string) => {
    try {
      await updateDoc(doc(db, "users", id), { rola });
      toast.success("Rola zaktualizowana.");
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się zmienić roli.");
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm("Usunąć użytkownika z bazy klubu?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("Użytkownik usunięty.");
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się usunąć użytkownika.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const phrase = search.toLowerCase();
    return (
      user.imie?.toLowerCase().includes(phrase) ||
      user.nazwisko?.toLowerCase().includes(phrase) ||
      user.email?.toLowerCase().includes(phrase)
    );
  });

  return (
    <>
      <AdminPageHeader
        title="Rodzice i użytkownicy"
        description="Zarządzaj kontami, rolami i dostępem do paneli."
        action={
          <button
            type="button"
            onClick={loadUsers}
            className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            Odśwież
          </button>
        }
      />

      <input
        type="text"
        placeholder="Szukaj użytkownika..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="zks-card mb-6 w-full border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none focus:border-zks-gold-mid"
      />

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie użytkowników...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">Nie znaleziono użytkowników.</div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="zks-card p-6">
              <h2 className="text-xl font-bold text-white">
                {user.imie || "Brak"} {user.nazwisko || "danych"}
              </h2>

              <div className="mt-3 space-y-1 text-sm text-zks-text">
                <p>Email: {user.email || "-"}</p>
                <p>Telefon: {user.telefon || "-"}</p>
                {user.uid && <p className="break-all text-xs text-zks-text-muted">UID: {user.uid}</p>}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-xs uppercase tracking-wide text-zks-gold-mid">
                  Rola
                </label>
                <select
                  value={user.rola || "rodzic"}
                  onChange={(e) => changeRole(user.id, e.target.value)}
                  className="rounded-lg border border-zks-gold-mid/30 bg-zks-black px-3 py-2 text-sm text-white outline-none"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => removeUser(user.id)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Usuń użytkownika
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
