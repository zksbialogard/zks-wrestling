"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { auth } from "@/lib/firebase";

type EmailStatus = {
  configured: boolean;
  from: string;
  hint: string;
};

export default function EmailSettingsCard() {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/email");
        const result = await response.json();
        setStatus(result);
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
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Nie udało się wysłać testu.");
      }

      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd testu e-mail.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="zks-card mb-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10">
            <Mail className="h-5 w-5 text-zks-gold-bright" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
              E-mail (Resend)
            </h2>
            <p className="mt-1 text-sm text-zks-text-muted">
              Powiadomienia e-mail do rodziców przy zgłoszeniach i z komunikatu admina.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={sending || loading}
          onClick={sendTestEmail}
          className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-xs disabled:opacity-60"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Wyślij test
        </button>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-zks-text-muted">Sprawdzanie konfiguracji...</p>
      ) : status ? (
        <div className="mt-4 space-y-2 text-sm">
          <p>
            Status:{" "}
            <span className={status.configured ? "text-green-400" : "text-red-400"}>
              {status.configured ? "skonfigurowany ✓" : "brak RESEND_API_KEY"}
            </span>
          </p>
          <p className="text-zks-text-muted">Nadawca: {status.from}</p>
          <p className="text-zks-text-muted">{status.hint}</p>
          {!status.configured && (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-zks-text-muted">
              <li>Załóż konto na resend.com</li>
              <li>Skopiuj API Key → Vercel → RESEND_API_KEY</li>
              <li>Ustaw EMAIL_FROM (np. ZKS Białogard &lt;onboarding@resend.dev&gt;)</li>
              <li>Redeploy aplikacji</li>
            </ol>
          )}
        </div>
      ) : null}
    </div>
  );
}
