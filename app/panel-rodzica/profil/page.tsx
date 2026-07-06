"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

import AuthField from "@/components/auth/AuthField";
import { useAuth } from "@/components/auth/AuthProvider";
import PushSettingsCard from "@/components/parent/PushSettingsCard";
import { PanelLoadingState, PanelPage, PanelPageHeader } from "@/components/layout/PanelLayout";
import { db } from "@/lib/firebase";

function formatPhoneDisplay(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

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
        setTelefon((data.telefon || "").replace(/\D/g, "").slice(0, 9));
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
    return <PanelLoadingState label="Ładowanie profilu..." />;
  }

  const fullName = [imie, nazwisko].filter(Boolean).join(" ") || "Rodzic";

  return (
    <PanelPage>
      <PanelPageHeader
        title="Moje dane"
        description="Edytuj dane kontaktowe powiązane z kontem rodzica."
      />

      <div className="zks-card zks-card-pad flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-zks-gold-mid/30 bg-zks-gold/10">
          <User className="h-7 w-7 text-zks-gold-bright" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-white">
            {fullName}
          </p>
          <div className="mt-2 flex flex-col gap-1.5 text-sm text-zks-text-muted sm:flex-row sm:flex-wrap sm:gap-x-5">
            {email && (
              <span className="inline-flex items-center gap-2 break-all">
                <Mail className="h-4 w-4 shrink-0 text-zks-gold-mid" />
                {email}
              </span>
            )}
            {telefon && (
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-zks-gold-mid" />
                +48 {formatPhoneDisplay(telefon)}
              </span>
            )}
          </div>
        </div>
      </div>

      <PushSettingsCard role="rodzic" />

      <form onSubmit={save} className="zks-card zks-card-pad space-y-5 sm:max-w-2xl">
        <h3 className="panel-section-title">Edycja danych</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField label="Imię" value={imie} onChange={(e) => setImie(e.target.value)} />
          <AuthField
            label="Nazwisko"
            value={nazwisko}
            onChange={(e) => setNazwisko(e.target.value)}
          />
        </div>

        <div>
          <AuthField
            label="Telefon"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="np. 500 123 456"
            value={formatPhoneDisplay(telefon)}
            onChange={(e) =>
              setTelefon(e.target.value.replace(/\D/g, "").slice(0, 9))
            }
          />
          <p className="mt-1.5 text-xs text-zks-text-muted">
            9 cyfr bez prefiksu — używany do SMS od klubu.
          </p>
        </div>

        <AuthField label="Email" type="email" value={email} readOnly />

        <button
          type="submit"
          disabled={saving}
          className="zks-btn-primary min-h-[44px] w-full px-6 py-3 text-sm disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </form>
    </PanelPage>
  );
}
