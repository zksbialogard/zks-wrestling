"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { SMS_AUTO_TRIGGERS } from "@/lib/template-editor-utils";
import { auth } from "@/lib/firebase";

type SmsStatus = {
  configured: boolean;
  sender: string;
  totalParents: number;
  parentsWithPhone: number;
  hint: string;
};

export default function SmsSettingsCard() {
  const [status, setStatus] = useState<SmsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testPhone, setTestPhone] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/sms");
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

  async function sendTestSms() {
    try {
      setSending(true);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Brak sesji administratora.");
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/admin/sms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: testPhone.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Nie udało się wysłać testu.");
      }

      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd testu SMS.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="zks-card mb-8 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10">
            <MessageSquare className="h-5 w-5 text-zks-gold-bright" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
              Wysyłka SMS
            </h2>
            <p className="mt-1 max-w-xl text-sm text-zks-text-muted">
              Rodzice dostają SMS na numer z profilu w Firebase. Poniżej edytujesz treści
              poszczególnych wiadomości.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-zks-text-muted">Sprawdzanie...</p>
        ) : status?.configured ? (
          <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
            SMSAPI gotowe
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            Brak SMSAPI_TOKEN
          </span>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-zks-gold-mid/15 bg-zks-black/50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zks-gold-mid">
          Kiedy aplikacja wysyła SMS?
        </p>
        <ul className="space-y-1.5 text-sm text-zks-text-muted">
          {SMS_AUTO_TRIGGERS.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-zks-gold-bright">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {loading ? null : status ? (
        <div className="mt-5 space-y-4">
          {!status.configured ? (
            <p className="text-sm text-zks-text-muted">
              Dodaj <strong className="text-white">SMSAPI_TOKEN</strong> na Vercel i zrób redeploy,
              żeby SMS-y zaczęły wychodzić.
            </p>
          ) : (
            <>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p className="text-zks-text-muted">
                  Nadawca: <span className="text-white">{status.sender}</span>
                </p>
                <p className="text-zks-text-muted">
                  Rodzice z telefonem:{" "}
                  <span className="text-white">
                    {status.parentsWithPhone} / {status.totalParents}
                  </span>
                </p>
              </div>

              <p className="text-xs text-zks-text-muted">
                Nazwa nadawcy musi być zatwierdzona w SMSAPI → Pola nadawcy. Jeśli test
                pada z błędem „Invalid from field”, ustaw na Vercel krótszą nazwę, np.{" "}
                <strong className="text-white">SMSAPI_FROM=ZKS</strong>.
              </p>

              <p className="text-sm text-zks-text-muted">{status.hint}</p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-2 block text-sm text-white">Test na numer (9 cyfr)</label>
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="np. 790335967"
                    className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={sending || testPhone.length !== 9}
                  onClick={sendTestSms}
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
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
