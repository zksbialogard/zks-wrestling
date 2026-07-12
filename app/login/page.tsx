"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";
import { useAuth } from "@/components/auth/AuthProvider";
import { getPanelHref, isPanelPathAllowedForRole } from "@/lib/panel-routes";
import { loginAsGuest } from "@/lib/guest-auth";
import { isGuestRole } from "@/lib/user-roles";
import { auth } from "@/lib/firebase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, ready, refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const nextPath = searchParams.get("next");

  useEffect(() => {
    if (!ready || !user || !profile) return;

    if (isGuestRole(profile.rola)) {
      router.replace("/");
      return;
    }

    const destination =
      nextPath && isPanelPathAllowedForRole(nextPath, profile.rola)
        ? nextPath
        : getPanelHref(profile.rola);

    router.replace(destination);
  }, [ready, user, profile, nextPath, router]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Uzupełnij email i hasło.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await refreshProfile();
      toast.success("Zalogowano pomyślnie.");
    } catch {
      toast.error("Błędny email lub hasło.");
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = async () => {
    setGuestLoading(true);

    try {
      await loginAsGuest();
      toast.success("Kontynuujesz jako gość — dostęp tylko do podglądu strony.");
      router.replace("/");
    } catch {
      toast.error(
        "Nie udało się wejść jako gość. W Firebase włącz Anonymous Authentication."
      );
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Logowanie"
      subtitle="Sesja jest zapisywana — nie wyloguje Cię po zamknięciu aplikacji."
      footer={
        <p className="text-center text-sm text-zks-text-muted">
          Nie masz konta?{" "}
          <Link
            href="/rejestracja"
            className="font-semibold text-zks-gold-bright transition hover:text-zks-gold"
          >
            Zarejestruj się
          </Link>
        </p>
      }
    >
      <form onSubmit={login} className="space-y-5">
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
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="text-right">
          <Link
            href="/zapomnialem-hasla"
            className="text-sm text-zks-gold-mid transition hover:text-zks-gold-bright"
          >
            Zapomniałem hasła
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || guestLoading}
          className="zks-btn-primary w-full py-3.5 text-sm disabled:opacity-60"
        >
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>

        <div className="relative py-2 text-center">
          <span className="bg-zks-black px-3 text-xs uppercase tracking-wide text-zks-text-muted">
            lub
          </span>
        </div>

        <button
          type="button"
          onClick={continueAsGuest}
          disabled={loading || guestLoading}
          className="zks-btn-outline w-full py-3.5 text-sm disabled:opacity-60"
        >
          {guestLoading ? "Łączenie..." : "Kontynuuj jako gość"}
        </button>
        <p className="text-center text-xs leading-relaxed text-zks-text-muted">
          Gość może przeglądać stronę klubu bez panelu rodzica, zawodnika i bez zapisów.
        </p>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zks-black" />}>
      <LoginForm />
    </Suspense>
  );
}
