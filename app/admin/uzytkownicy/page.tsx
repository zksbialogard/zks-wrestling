"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { RefreshCw, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useAuth } from "@/components/auth/AuthProvider";
import { db } from "@/lib/firebase";
import { ROLE_LABELS, USER_ROLES, getRoleLabel } from "@/lib/user-roles";
import { updateUserRoleAsAdmin } from "@/lib/users-admin-client";

interface UserItem {
  id: string;
  uid?: string;
  email?: string;
  imie?: string;
  nazwisko?: string;
  telefon?: string;
  rola?: string;
}

export default function AdminUzytkownicyPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

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
    if (!user) {
      toast.error("Zaloguj się ponownie jako administrator.");
      return;
    }

    try {
      setSavingId(id);
      await updateUserRoleAsAdmin(id, rola as (typeof USER_ROLES)[number]);
      toast.success(`Rola zmieniona na: ${getRoleLabel(rola)}. Użytkownik zobaczy nowy panel po odświeżeniu.`);
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Nie udało się zmienić roli.");
    } finally {
      setSavingId(null);
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

  const filteredUsers = users.filter((userItem) => {
    if (userItem.rola === "zawodnik") {
      return false;
    }

    const phrase = search.toLowerCase();
    return (
      userItem.imie?.toLowerCase().includes(phrase) ||
      userItem.nazwisko?.toLowerCase().includes(phrase) ||
      userItem.email?.toLowerCase().includes(phrase) ||
      getRoleLabel(userItem.rola).toLowerCase().includes(phrase)
    );
  });

  return (
    <>
      <AdminPageHeader
        title="Rodzice"
        description="Konta rodziców i pozostałych użytkowników (admin, trener). Konta zawodnika zarządzaj w sekcji Zawodnicy."
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
          {filteredUsers.map((userItem) => (
            <div key={userItem.id} className="zks-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {userItem.imie || "Brak"} {userItem.nazwisko || "danych"}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-wide text-zks-gold-mid">
                    Aktualna rola: {getRoleLabel(userItem.rola)}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-zks-text">
                <p>Email: {userItem.email || "-"}</p>
                <p>Telefon: {userItem.telefon || "-"}</p>
                {userItem.uid && (
                  <p className="break-all text-xs text-zks-text-muted">UID: {userItem.uid}</p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-xs uppercase tracking-wide text-zks-gold-mid">
                  Zmień rolę
                </label>
                <select
                  value={userItem.rola || "rodzic"}
                  disabled={savingId === userItem.id}
                  onChange={(e) => changeRole(userItem.id, e.target.value)}
                  className="rounded-lg border border-zks-gold-mid/30 bg-zks-black px-3 py-2 text-sm text-white outline-none disabled:opacity-60"
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
                {savingId === userItem.id ? (
                  <span className="text-xs text-zks-text-muted">Zapisywanie...</span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => removeUser(userItem.id)}
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
