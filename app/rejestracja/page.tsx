"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "sonner";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";
import { auth, db } from "@/lib/firebase";

export default function RejestracjaPage() {
  const router = useRouter();

  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [zgoda, setZgoda] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!imie || !nazwisko || !telefon || !email || !haslo) {
      toast.error("Uzupełnij wszystkie pola.");
      return;
    }

    if (telefon.length !== 9) {
      toast.error("Numer telefonu musi mieć 9 cyfr.");
      return;
    }

    if (!zgoda) {
      toast.error("Musisz zaakceptować regulamin i zgodę RODO.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        haslo
      );

      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        imie,
        nazwisko,
        telefon,
        email,
        rola: "rodzic",
        createdAt: new Date(),
      });

      await sendEmailVerification(userCredential.user);

      toast.success("Konto utworzone! Sprawdź email i potwierdź rejestrację.");

      router.push("/login");
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : "";

      if (code === "auth/email-already-in-use") {
        toast.error("Ten adres email jest już używany.");
      } else if (code === "auth/weak-password") {
        toast.error("Hasło musi mieć minimum 6 znaków.");
      } else if (code === "auth/invalid-email") {
        toast.error("Nieprawidłowy adres email.");
      } else {
        toast.error("Wystąpił błąd podczas rejestracji.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Rejestracja"
      subtitle="Załóż konto rodzica i zarządzaj danymi swoich dzieci w klubie."
      footer={
        <p className="text-center text-sm text-zks-text-muted">
          Masz już konto?{" "}
          <Link
            href="/login"
            className="font-semibold text-zks-gold-bright transition hover:text-zks-gold"
          >
            Zaloguj się
          </Link>
        </p>
      }
    >
      <form onSubmit={register} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label="Imię"
            type="text"
            name="imie"
            autoComplete="given-name"
            placeholder="Jan"
            value={imie}
            onChange={(e) => setImie(e.target.value)}
          />

          <AuthField
            label="Nazwisko"
            type="text"
            name="nazwisko"
            autoComplete="family-name"
            placeholder="Kowalski"
            value={nazwisko}
            onChange={(e) => setNazwisko(e.target.value)}
          />
        </div>

        <AuthField
          label="Telefon"
          type="tel"
          name="telefon"
          autoComplete="tel"
          placeholder="123456789"
          value={telefon}
          onChange={(e) =>
            setTelefon(e.target.value.replace(/\D/g, "").slice(0, 9))
          }
        />

        <AuthField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="twoj@email.pl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthField
          label="Hasło"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Minimum 6 znaków"
          value={haslo}
          onChange={(e) => setHaslo(e.target.value)}
        />

        <label className="flex items-start gap-3 text-sm leading-relaxed text-zks-text">
          <input
            type="checkbox"
            checked={zgoda}
            onChange={(e) => setZgoda(e.target.checked)}
            className="mt-1 accent-zks-gold"
          />
          <span>
            Akceptuję regulamin oraz wyrażam zgodę na przetwarzanie danych
            osobowych w aplikacji ZKS Białogard — Manager.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="zks-btn-primary w-full py-3.5 text-sm disabled:opacity-60"
        >
          {loading ? "Tworzenie konta..." : "Zarejestruj się"}
        </button>

        <p className="text-center text-xs text-zks-text-muted">
          Po rejestracji wyślemy wiadomość weryfikacyjną na podany adres email.
        </p>
      </form>
    </AuthLayout>
  );
}
