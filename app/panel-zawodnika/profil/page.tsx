"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { Loader2, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

import AuthField from "@/components/auth/AuthField";
import { useAuth } from "@/components/auth/AuthProvider";
import PushSettingsCard from "@/components/parent/PushSettingsCard";
import { db } from "@/lib/firebase";
import {
  TRAINING_GROUP_OPTIONS,
  getTrainingGroupLabel,
  type TrainingGroupId,
} from "@/lib/training-groups";

function formatPhoneDisplay(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export default function AthleteProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [docId, setDocId] = useState("");
  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [grupaTreningowa, setGrupaTreningowa] = useState<TrainingGroupId>("srednia");
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
        setGrupaTreningowa((data.grupaTreningowa as TrainingGroupId) || "srednia");
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
        grupaTreningowa,
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
    return (
      <div className="flex items-center gap-3 text-zks-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        Ładowanie profilu...
      </div>
    );
  }

  const fullName = [imie, nazwisko].filter(Boolean).join(" ") || "Zawodnik";

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
          Moje dane
        </h2>
        <p className="mt-2 text-sm text-zks-text-muted">
          Edytuj dane kontaktowe i grupę treningową powiązaną z kontem zawodnika.
        </p>
      </div>

      <div className="zks-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-zks-gold-mid/30 bg-zks-gold/10">
          <User className="h-7 w-7 text-zks-gold-bright" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-white">
            {fullName}
          </p>
          <p className="mt-1 text-sm text-zks-gold-bright">
            {getTrainingGroupLabel(grupaTreningowa)}
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

      <PushSettingsCard />

      <form onSubmit={save} className="zks-card space-y-5 p-5 sm:max-w-2xl sm:p-6">
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
          Edycja danych
        </h3>

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
                {group.label} ({group.start}–{group.end})
              </option>
            ))}
          </select>
        </label>

        <AuthField label="Email" type="email" value={email} readOnly />

        <button
          type="submit"
          disabled={saving}
          className="zks-btn-primary min-h-[44px] w-full px-6 py-3 text-sm disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </form>
    </div>
  );
}
