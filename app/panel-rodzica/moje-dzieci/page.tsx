"use client";

import { useEffect, useState } from "react";
import {
  doc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import AuthField from "@/components/auth/AuthField";
import ChildCard from "@/components/children/ChildCard";
import {
  createChildForParent,
  findChildByIdentityKey,
  loadChildrenForParent,
  unlinkParentFromChild,
  type StoredChild,
} from "@/lib/children-client";
import { childIdentityPayload, isParentLinkedToChild } from "@/lib/children-identity";
import { db } from "@/lib/firebase";
import {
  TRAINING_GROUP_OPTIONS,
  type TrainingGroupId,
} from "@/lib/training-groups";

type Child = StoredChild;

const emptyForm = {
  imie: "",
  nazwisko: "",
  rokUrodzenia: "",
  plec: "M",
  kategoriaWagowa: "",
  grupaTreningowa: "srednia" as TrainingGroupId,
};

export default function MojeDzieciPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadChildren = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const list = await loadChildrenForParent(db, user.uid);
      setChildren(list);
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się wczytać listy dzieci.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, [user]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const saveChild = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) return;

    if (!form.imie || !form.nazwisko || !form.rokUrodzenia || !form.kategoriaWagowa || !form.grupaTreningowa) {
      toast.error("Uzupełnij wymagane pola dziecka.");
      return;
    }

    try {
      if (editingId) {
        const identity = childIdentityPayload(form.imie, form.nazwisko, form.rokUrodzenia);

        await updateDoc(doc(db, "children", editingId), {
          ...identity,
          plec: form.plec,
          kategoriaWagowa: form.kategoriaWagowa,
          grupaTreningowa: form.grupaTreningowa,
        });
        toast.success("Dane dziecka zaktualizowane.");
      } else {
        const identity = childIdentityPayload(form.imie, form.nazwisko, form.rokUrodzenia);
        const existing = await findChildByIdentityKey(db, identity.identityKey);

        if (existing && isParentLinkedToChild(existing, user.uid)) {
          toast.info("To dziecko jest już na Twojej liście.");
          resetForm();
          await loadChildren();
          return;
        }

        const linked = await createChildForParent(db, user.uid, {
          imie: form.imie,
          nazwisko: form.nazwisko,
          rokUrodzenia: form.rokUrodzenia,
          plec: form.plec,
          kategoriaWagowa: form.kategoriaWagowa,
          grupaTreningowa: form.grupaTreningowa,
        });

        if (linked.parentUids.length > 1) {
          toast.success("To dziecko jest już w klubie — powiązaliśmy je z Twoim kontem.");
        } else {
          toast.success("Dziecko dodane.");
        }
      }

      resetForm();
      await loadChildren();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się zapisać danych dziecka.");
    }
  };

  const startEdit = (child: Child) => {
    setEditingId(child.id);
    setForm({
      imie: child.imie,
      nazwisko: child.nazwisko,
      rokUrodzenia: child.rokUrodzenia,
      plec: child.plec,
      kategoriaWagowa: child.kategoriaWagowa,
      grupaTreningowa: child.grupaTreningowa || "srednia",
    });
    setShowForm(true);
  };

  const removeChild = async (id: string) => {
    if (!user) return;

    if (!confirm("Odłączyć dziecko od Twojego konta?")) return;

    try {
      await unlinkParentFromChild(db, id, user.uid);
      toast.success("Dziecko odłączone od konta.");
      await loadChildren();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się usunąć dziecka.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
            Moje dzieci
          </h2>
          <p className="mt-2 text-sm text-zks-text-muted">
            Dodawaj, edytuj i zarządzaj profilami swoich zawodników.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="zks-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" />
          Dodaj dziecko
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveChild} className="zks-card mb-6 grid gap-4 p-6 md:grid-cols-2">
          <h3 className="md:col-span-2 font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
            {editingId ? "Edytuj dziecko" : "Nowe dziecko"}
          </h3>

          <AuthField
            label="Imię"
            value={form.imie}
            onChange={(e) => setForm({ ...form, imie: e.target.value })}
          />
          <AuthField
            label="Nazwisko"
            value={form.nazwisko}
            onChange={(e) => setForm({ ...form, nazwisko: e.target.value })}
          />
          <AuthField
            label="Rok urodzenia"
            value={form.rokUrodzenia}
            onChange={(e) =>
              setForm({
                ...form,
                rokUrodzenia: e.target.value.replace(/\D/g, "").slice(0, 4),
              })
            }
          />
          <AuthField
            label="Kategoria wagowa (kg)"
            value={form.kategoriaWagowa}
            onChange={(e) => setForm({ ...form, kategoriaWagowa: e.target.value })}
          />

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
              Płeć
            </span>
            <select
              value={form.plec}
              onChange={(e) => setForm({ ...form, plec: e.target.value })}
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
              value={form.grupaTreningowa}
              onChange={(e) =>
                setForm({
                  ...form,
                  grupaTreningowa: e.target.value as TrainingGroupId,
                })
              }
              className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3.5 text-sm text-white outline-none"
            >
              {TRAINING_GROUP_OPTIONS.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="zks-btn-primary px-6 py-2.5 text-sm">
              {editingId ? "Zapisz zmiany" : "Dodaj dziecko"}
            </button>
            <button type="button" onClick={resetForm} className="zks-btn-outline px-6 py-2.5 text-sm">
              Anuluj
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie...</p>
      ) : children.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">
          Nie masz jeszcze dodanych dzieci. Kliknij „Dodaj dziecko”.
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onEdit={() => startEdit(child)}
              onDelete={() => removeChild(child.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
