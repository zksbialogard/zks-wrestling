"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { toast } from "sonner";

import AuthField from "@/components/auth/AuthField";
import { useAuth } from "@/components/auth/AuthProvider";
import { db } from "@/lib/firebase";

export default function ParentProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [docId, setDocId] = useState("");
  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      setEmail(user.email || "");

      const snapshot = await getDocs(
        query(collection(db, "users"), where("uid", "==", user.uid))
      );

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        setDocId(docSnap.id);
        setImie(data.imie || "");
        setNazwisko(data.nazwisko || "");
        setTelefon(data.telefon || "");
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!docId) {
      toast.error("Nie znaleziono profilu użytkownika.");
      return;
    }

    setSaving(true);

    try {
      await updateDoc(doc(db, "users", docId), {
        imie,
        nazwisko,
        telefon,
      });

      await refreshProfile();
      toast.success("Profil zapisany.");
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się zapisać profilu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-zks-text-muted">Ładowanie profilu...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
        Moje dane
      </h2>
      <p className="mt-2 text-sm text-zks-text-muted">
        Edytuj swoje dane kontaktowe powiązane z kontem rodzica.
      </p>

      <form onSubmit={save} className="zks-card mt-6 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField label="Imię" value={imie} onChange={(e) => setImie(e.target.value)} />
          <AuthField
            label="Nazwisko"
            value={nazwisko}
            onChange={(e) => setNazwisko(e.target.value)}
          />
        </div>

        <AuthField
          label="Telefon"
          value={telefon}
          onChange={(e) =>
            setTelefon(e.target.value.replace(/\D/g, "").slice(0, 9))
          }
        />

        <AuthField label="Email" type="email" value={email} readOnly />

        <button
          type="submit"
          disabled={saving}
          className="zks-btn-primary px-6 py-3 text-sm disabled:opacity-60"
        >
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </form>
    </div>
  );
}
