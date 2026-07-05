"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      toast.error("Podaj adres email.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Wysłaliśmy link do resetu hasła na podany email.");
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : "";

      if (code === "auth/user-not-found") {
        toast.error("Nie znaleziono konta z tym adresem email.");
      } else if (code === "auth/invalid-email") {
        toast.error("Nieprawidłowy adres email.");
      } else {
        toast.error("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset hasła"
      subtitle="Podaj email powiązany z kontem. Wyślemy instrukcję zmiany hasła."
      footer={
        <p className="text-center text-sm text-zks-text-muted">
          Pamiętasz hasło?{" "}
          <Link
            href="/login"
            className="font-semibold text-zks-gold-bright transition hover:text-zks-gold"
          >
            Zaloguj się
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <p className="text-sm leading-relaxed text-zks-text">
            Jeśli konto istnieje, wiadomość z linkiem do resetu hasła została
            wysłana na <strong className="text-zks-gold-bright">{email}</strong>.
          </p>
          <p className="text-xs text-zks-text-muted">
            Sprawdź folder spam, jeśli nie widzisz wiadomości w skrzynce
            odbiorczej.
          </p>
          <Link href="/login" className="zks-btn-outline inline-flex px-6 py-3 text-sm">
            Wróć do logowania
          </Link>
        </div>
      ) : (
        <form onSubmit={resetPassword} className="space-y-5">
          <AuthField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="twoj@email.pl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="zks-btn-primary w-full py-3.5 text-sm disabled:opacity-60"
          >
            {loading ? "Wysyłanie..." : "Wyślij link resetujący"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
