"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ChildParentLinks from "@/components/admin/ChildParentLinks";
import ChildrenDeduplicationPanel from "@/components/admin/ChildrenDeduplicationPanel";
import AuthField from "@/components/auth/AuthField";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  childIdentityPayload,
  mergeChildrenByIdentity,
} from "@/lib/children-identity";
import { findChildByIdentityKey, linkParentToChild } from "@/lib/children-client";
import { db } from "@/lib/firebase";
import {
  TRAINING_GROUP_OPTIONS,
  getTrainingGroupLabel,
  type TrainingGroupId,
} from "@/lib/training-groups";
import { ROLE_LABELS, USER_ROLES, getRoleLabel } from "@/lib/user-roles";
import { updateUserRoleAsAdmin } from "@/lib/users-admin-client";

interface Child {
  id: string;
  imie: string;
  nazwisko: string;
  rokUrodzenia: string;
  plec: string;
  kategoriaWagowa: string;
  parentUid: string;
  parentUids?: string[];
  identityKey?: string;
  grupaTreningowa?: TrainingGroupId;
}

interface AthleteAccount {
  id: string;
  uid?: string;
  email?: string;
  imie?: string;
  nazwisko?: string;
  telefon?: string;
  rola?: string;
  grupaTreningowa?: TrainingGroupId;
}

interface ParentUser {
  uid: string;
  label: string;
}

export default function AdminZawodnicyPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [athleteAccounts, setAthleteAccounts] = useState<AthleteAccount[]>([]);
  const [parentUsers, setParentUsers] = useState<ParentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAccountId, setSavingAccountId] = useState<string | null>(null);

  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [rokUrodzenia, setRokUrodzenia] = useState("");
  const [plec, setPlec] = useState("M");
  const [kategoriaWagowa, setKategoriaWagowa] = useState("");
  const [parentUid, setParentUid] = useState("");
  const [grupaTreningowa, setGrupaTreningowa] = useState<TrainingGroupId>("srednia");

  const loadChildren = async () => {
    try {
      const [childrenSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, "children")),
        getDocs(collection(db, "users")),
      ]);

      setChildren(
        childrenSnapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Child, "id">),
        }))
      );

      setAthleteAccounts(
        usersSnapshot.docs
          .map((item) => ({
            id: item.id,
            ...(item.data() as Omit<AthleteAccount, "id">),
          }))
          .filter((item) => item.rola === "zawodnik")
      );

      setParentUsers(
        usersSnapshot.docs
          .map((item) => {
            const data = item.data() as {
              uid?: string;
              email?: string;
              imie?: string;
              nazwisko?: string;
              rola?: string;
            };

            return {
              uid: data.uid || item.id,
              email: data.email,
              imie: data.imie,
              nazwisko: data.nazwisko,
              rola: data.rola,
            };
          })
          .filter((item) => item.rola === "rodzic")
          .map((item) => ({
            uid: item.uid,
            label: `${item.imie || ""} ${item.nazwisko || ""}`.trim() || item.email || item.uid,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, "pl"))
      );
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się wczytać zawodników.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const changeAccountRole = async (id: string, rola: string) => {
    if (!user) {
      toast.error("Zaloguj się ponownie jako administrator.");
      return;
    }

    try {
      setSavingAccountId(id);
      await updateUserRoleAsAdmin(id, rola as (typeof USER_ROLES)[number]);
      toast.success(`Rola zmieniona na: ${getRoleLabel(rola)}.`);
      await loadChildren();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Nie udało się zmienić roli.");
    } finally {
      setSavingAccountId(null);
    }
  };

  const addChild = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!imie || !nazwisko || !rokUrodzenia || !kategoriaWagowa) {
      toast.error("Uzupełnij wymagane pola zawodnika.");
      return;
    }

    setSaving(true);

    try {
      const identity = childIdentityPayload(imie, nazwisko, rokUrodzenia);
      const existing = await findChildByIdentityKey(db, identity.identityKey);

      if (existing) {
        if (parentUid) {
          await linkParentToChild(db, existing.id, parentUid);
          toast.success(`${imie} ${nazwisko} już istnieje — rodzic został przypisany.`);
        } else {
          toast.warning(
            `${imie} ${nazwisko} jest już w klubie. Wybierz rodzica, aby go przypisać.`
          );
        }
        setSaving(false);
        await loadChildren();
        return;
      }

      await addDoc(collection(db, "children"), {
        ...identity,
        plec,
        kategoriaWagowa,
        grupaTreningowa,
        parentUid: parentUid || "admin",
        parentUids: parentUid ? [parentUid] : ["admin"],
        createdAt: new Date(),
      });

      toast.success("Zawodnik dodany.");
      setImie("");
      setNazwisko("");
      setRokUrodzenia("");
      setKategoriaWagowa("");
      setParentUid("");
      setGrupaTreningowa("srednia");
      await loadChildren();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się dodać zawodnika.");
    } finally {
      setSaving(false);
    }
  };

  const updateGroup = async (id: string, groupId: TrainingGroupId) => {
    try {
      await updateDoc(doc(db, "children", id), {
        grupaTreningowa: groupId,
      });
      toast.success("Grupa treningowa zaktualizowana.");
      await loadChildren();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się zapisać grupy.");
    }
  };

  const removeChild = async (id: string, duplicateIds: string[] = []) => {
    if (!confirm("Usunąć zawodnika?")) return;

    try {
      await deleteDoc(doc(db, "children", id));

      for (const duplicateId of duplicateIds) {
        await deleteDoc(doc(db, "children", duplicateId));
      }

      toast.success("Zawodnik usunięty.");
      await loadChildren();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się usunąć zawodnika.");
    }
  };

  const mergedChildren = mergeChildrenByIdentity(children);

  return (
    <>
      <AdminPageHeader
        title="Zawodnicy"
        description="Konta zawodników oraz profile dzieci w klubie. Zmiana roli na „Rodzic” przenosi konto do sekcji Rodzice."
      />

      <section className="mb-8">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
          Konta zawodnika
        </h2>

        {loading ? (
          <p className="text-zks-text-muted">Ładowanie kont...</p>
        ) : athleteAccounts.length === 0 ? (
          <div className="zks-card p-6 text-zks-text-muted">Brak kont z rolą zawodnik.</div>
        ) : (
          <div className="grid gap-4">
            {athleteAccounts.map((account) => (
              <div key={account.id} className="zks-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {account.imie || "Brak"} {account.nazwisko || "danych"}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-wide text-zks-gold-mid">
                      Konto zawodnika
                      {account.grupaTreningowa
                        ? ` · ${getTrainingGroupLabel(account.grupaTreningowa)}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-zks-text">
                  <p>Email: {account.email || "-"}</p>
                  <p>Telefon: {account.telefon || "-"}</p>
                  {account.uid ? (
                    <p className="break-all text-xs text-zks-text-muted">UID: {account.uid}</p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="text-xs uppercase tracking-wide text-zks-gold-mid">
                    Zmień rolę
                  </label>
                  <select
                    value={account.rola || "zawodnik"}
                    disabled={savingAccountId === account.id}
                    onChange={(e) => changeAccountRole(account.id, e.target.value)}
                    className="rounded-lg border border-zks-gold-mid/30 bg-zks-black px-3 py-2 text-sm text-white outline-none disabled:opacity-60"
                  >
                    {USER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  {savingAccountId === account.id ? (
                    <span className="text-xs text-zks-text-muted">Zapisywanie...</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
          Profile zawodników (dzieci)
        </h2>
      </section>

      <ChildrenDeduplicationPanel />

      <form onSubmit={addChild} className="zks-card mb-8 grid gap-4 p-6 md:grid-cols-2">
        <h2 className="md:col-span-2 font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
          Dodaj zawodnika
        </h2>

        <AuthField label="Imię" value={imie} onChange={(e) => setImie(e.target.value)} />
        <AuthField label="Nazwisko" value={nazwisko} onChange={(e) => setNazwisko(e.target.value)} />
        <AuthField
          label="Rok urodzenia"
          value={rokUrodzenia}
          onChange={(e) => setRokUrodzenia(e.target.value.replace(/\D/g, "").slice(0, 4))}
        />
        <AuthField
          label="Kategoria wagowa (kg)"
          value={kategoriaWagowa}
          onChange={(e) => setKategoriaWagowa(e.target.value)}
        />

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Płeć
          </span>
          <select
            value={plec}
            onChange={(e) => setPlec(e.target.value)}
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3.5 text-sm text-white outline-none"
          >
            <option value="M">Mężczyzna</option>
            <option value="K">Kobieta</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Grupa treningowa
          </span>
          <select
            value={grupaTreningowa}
            onChange={(e) => setGrupaTreningowa(e.target.value as TrainingGroupId)}
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3.5 text-sm text-white outline-none"
          >
            {TRAINING_GROUP_OPTIONS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Rodzic (opcjonalnie)
          </span>
          <select
            value={parentUid}
            onChange={(e) => setParentUid(e.target.value)}
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3.5 text-sm text-white outline-none"
          >
            <option value="">Bez przypisanego rodzica</option>
            {parentUsers.map((parent) => (
              <option key={parent.uid} value={parent.uid}>
                {parent.label}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2">
          <button type="submit" disabled={saving} className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm">
            <UserPlus className="h-4 w-4" />
            {saving ? "Dodawanie..." : "Dodaj zawodnika"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie...</p>
      ) : mergedChildren.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">Brak zawodników.</div>
      ) : (
        <div className="grid gap-4">
          {mergedChildren.map((child) => (
            <div key={child.id} className="zks-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-zks-gold-bright">
                  {child.imie} {child.nazwisko}
                </h2>
                {child.duplicateIds.length > 0 ? (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-amber-300">
                    Scalono {child.duplicateIds.length + 1} wpisy
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid gap-1 text-sm text-zks-text sm:grid-cols-2">
                <p>Rok urodzenia: {child.rokUrodzenia}</p>
                <p>Płeć: {child.plec}</p>
                <p>Kategoria wagowa: {child.kategoriaWagowa} kg</p>
                <p className="sm:col-span-2 text-zks-text-muted">
                  Rodzice ({child.parentUids.length})
                </p>
              </div>

              <ChildParentLinks
                childId={child.id}
                parentUids={child.parentUids}
                parents={parentUsers}
                onChanged={loadChildren}
              />

              <label className="mt-4 block max-w-sm space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
                  Grupa treningowa
                </span>
                <select
                  value={child.grupaTreningowa || "srednia"}
                  onChange={(e) =>
                    updateGroup(child.id, e.target.value as TrainingGroupId)
                  }
                  className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none"
                >
                  {TRAINING_GROUP_OPTIONS.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zks-text-muted">
                  Aktualnie: {getTrainingGroupLabel(child.grupaTreningowa)}
                </p>
              </label>

              <button
                type="button"
                onClick={() => removeChild(child.id, child.duplicateIds)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Usuń
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
