"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { auth } from "@/lib/firebase";

type EmailStatus = {
  configured: boolean;
  from: string;
  sandbox: boolean;
  sandboxTestTo: string;
  hint: string;
};

export default function EmailSettingsCard() {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState("zksbialogard@wp.pl");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/email");
        const result = await response.json();
        setStatus(result);
        if (result.sandboxTestTo) {
          setTestEmail(result.sandboxTestTo);
        }
      } catch {
        setStatus(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function sendTestEmail() {
    try {
      setSending(true);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Brak sesji administratora.");
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/admin/email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: testEmail.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Nie udało się wysłać testu.");
      }

      toast.success(
        result.message ||
          `Test wysłany na ${result.to}. Sprawdź skrzynkę i folder SPAM.`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd testu e-mail.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="zks-card mb-8 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10">
            <Mail className="h-5 w-5 text-zks-gold-bright" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
              Wysyłka e-mail
            </h2>
            <p className="mt-1 max-w-xl text-sm text-zks-text-muted">
              Maile do rodziców przy zgłoszeniach i powiadomieniach z panelu admina.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-zks-text-muted">Sprawdzanie...</p>
        ) : status?.configured ? (
          <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
            Połączono z Resend
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400">
            Brak konfiguracji
          </span>
        )}
      </div>

      {loading ? null : status ? (
        <div className="mt-5 space-y-4">
          {!status.configured ? (
            <p className="text-sm text-zks-text-muted">
              Dodaj klucz API Resend w ustawieniach Vercel, potem zrób redeploy aplikacji.
            </p>
          ) : (
            <>
              {status.sandbox ? (
                <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-200">Tryb testowy Resend</p>
                    <p className="mt-1 text-amber-100/90">
                      Przy nadawcy <strong>onboarding@resend.dev</strong> test może iść tylko
                      na adres konta Resend ({status.sandboxTestTo}). Maile do rodziców
                      zadziałają po weryfikacji własnej domeny na{" "}
                      <a
                        href="https://resend.com/domains"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        resend.com/domains
                      </a>
                      .
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-2 block text-sm text-white">
                    Wyślij test na adres
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    disabled={status.sandbox}
                    className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none disabled:opacity-70"
                  />
                  {status.sandbox ? (
                    <p className="mt-1 text-xs text-zks-text-muted">
                      W trybie testowym wysyłka jest zablokowana na ten adres.
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  disabled={sending || !status.configured}
                  onClick={sendTestEmail}
                  className="zks-btn-outline inline-flex items-center justify-center gap-2 px-4 py-3 text-xs disabled:opacity-60"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Wyślij test
                </button>
              </div>

              <p className="text-xs text-zks-text-muted">
                Jeśli mail nie przychodzi, sprawdź folder <strong>SPAM</strong> i
                zakładkę „Promocje” w Gmailu.
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
