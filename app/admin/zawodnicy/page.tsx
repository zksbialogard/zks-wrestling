"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AuthField from "@/components/auth/AuthField";
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

export default function AdminZawodnicyPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [rokUrodzenia, setRokUrodzenia] = useState("");
  const [plec, setPlec] = useState("M");
  const [kategoriaWagowa, setKategoriaWagowa] = useState("");
  const [parentUid, setParentUid] = useState("");

  const loadChildren = async () => {
    try {
      const snapshot = await getDocs(collection(db, "children"));
      setChildren(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Child, "id">),
        }))
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

  const addChild = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!imie || !nazwisko || !rokUrodzenia || !kategoriaWagowa) {
      toast.error("Uzupełnij wymagane pola zawodnika.");
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "children"), {
        imie,
        nazwisko,
        rokUrodzenia,
        plec,
        kategoriaWagowa,
        parentUid: parentUid || "admin",
        createdAt: new Date(),
      });

      toast.success("Zawodnik dodany.");
      setImie("");
      setNazwisko("");
      setRokUrodzenia("");
      setKategoriaWagowa("");
      setParentUid("");
      await loadChildren();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się dodać zawodnika.");
    } finally {
      setSaving(false);
    }
  };

  const removeChild = async (id: string) => {
    if (!confirm("Usunąć zawodnika?")) return;

    try {
      await deleteDoc(doc(db, "children", id));
      toast.success("Zawodnik usunięty.");
      await loadChildren();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się usunąć zawodnika.");
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Zawodnicy"
        description="Przeglądaj, dodawaj i usuwaj profile zawodników klubu."
      />

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

        <AuthField
          label="UID rodzica (opcjonalnie)"
          value={parentUid}
          onChange={(e) => setParentUid(e.target.value)}
        />

        <div className="md:col-span-2">
          <button type="submit" disabled={saving} className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm">
            <UserPlus className="h-4 w-4" />
            {saving ? "Dodawanie..." : "Dodaj zawodnika"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie...</p>
      ) : children.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">Brak zawodników.</div>
      ) : (
        <div className="grid gap-4">
          {children.map((child) => (
            <div key={child.id} className="zks-card p-6">
              <h2 className="text-xl font-bold text-zks-gold-bright">
                {child.imie} {child.nazwisko}
              </h2>
              <div className="mt-3 grid gap-1 text-sm text-zks-text sm:grid-cols-2">
                <p>Rok urodzenia: {child.rokUrodzenia}</p>
                <p>Płeć: {child.plec}</p>
                <p>Kategoria wagowa: {child.kategoriaWagowa} kg</p>
                <p className="break-all text-zks-text-muted">Rodzic: {child.parentUid}</p>
              </div>

              <button
                type="button"
                onClick={() => removeChild(child.id)}
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
