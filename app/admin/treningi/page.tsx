"use client";

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AuthField from "@/components/auth/AuthField";
import { createTrainingExceptionAdmin } from "@/lib/training-exceptions-admin-client";
import {
  TRAINING_GROUP_OPTIONS,
  type TrainingGroupId,
} from "@/lib/training-groups";

export default function AdminTreningiPage() {
  const [groupId, setGroupId] = useState<TrainingGroupId>("starsza");
  const [sessionDate, setSessionDate] = useState("");
  const [status, setStatus] = useState<"cancelled" | "rescheduled">("cancelled");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [message, setMessage] = useState("");
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!sessionDate || !message.trim()) {
      toast.error("Uzupełnij datę treningu i komunikat.");
      return;
    }

    if (status === "rescheduled" && (!newStart || !newEnd)) {
      toast.error("Przy przełożeniu podaj nowe godziny treningu.");
      return;
    }

    setSaving(true);

    try {
      const result = await createTrainingExceptionAdmin({
        group_id: groupId,
        session_date: sessionDate,
        status,
        new_start: status === "rescheduled" ? newStart : undefined,
        new_end: status === "rescheduled" ? newEnd : undefined,
        message: message.trim(),
        notify: {
          inApp: notifyInApp,
          push: notifyPush,
          sms: notifySms,
          email: notifyEmail,
        },
      });

      const notifyResult = result.notifyResult;
      const summary = notifyResult
        ? `Powiadomiono ${notifyResult.inAppSent} użytkowników (push: ${notifyResult.pushSent}).`
        : "Wyjątek zapisany.";

      toast.success(summary);
      setMessage("");
      setSessionDate("");
      setNewStart("");
      setNewEnd("");
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Nie udało się zapisać wyjątku.";
      toast.error(text);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Treningi"
        description="Zgłaszaj odwołania i przełożenia treningów — grupa otrzyma powiadomienie."
      />

      <form onSubmit={submit} className="zks-card grid max-w-3xl gap-4 p-6 md:grid-cols-2">
        <h2 className="md:col-span-2 font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
          Wyjątek treningowy
        </h2>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Grupa
          </span>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value as TrainingGroupId)}
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3.5 text-sm text-white outline-none"
          >
            {TRAINING_GROUP_OPTIONS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </label>

        <AuthField
          label="Data treningu"
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
        />

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "cancelled" | "rescheduled")}
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3.5 text-sm text-white outline-none"
          >
            <option value="cancelled">Odwołany</option>
            <option value="rescheduled">Przełożony</option>
          </select>
        </label>

        {status === "rescheduled" && (
          <>
            <AuthField
              label="Nowa godzina startu"
              placeholder="np. 18:00"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
            />
            <AuthField
              label="Nowa godzina zakończenia"
              placeholder="np. 19:30"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
            />
          </>
        )}

        <label className="md:col-span-2 block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Komunikat dla grupy
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Np. Trening odwołany z powodu remontu sali."
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3.5 text-sm text-white outline-none"
          />
        </label>

        <div className="md:col-span-2 space-y-3 rounded-xl border border-zks-gold-mid/20 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            <Bell className="h-4 w-4 text-zks-gold-mid" />
            Powiadom grupę
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-zks-text">
              <input
                type="checkbox"
                checked={notifyInApp}
                onChange={(e) => setNotifyInApp(e.target.checked)}
                className="accent-zks-gold"
              />
              W aplikacji
            </label>
            <label className="flex items-center gap-2 text-sm text-zks-text">
              <input
                type="checkbox"
                checked={notifyPush}
                onChange={(e) => setNotifyPush(e.target.checked)}
                className="accent-zks-gold"
              />
              Push
            </label>
            <label className="flex items-center gap-2 text-sm text-zks-text">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="accent-zks-gold"
              />
              SMS
            </label>
            <label className="flex items-center gap-2 text-sm text-zks-text">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="accent-zks-gold"
              />
              Email
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Zapisywanie..." : "Zapisz i powiadom grupę"}
          </button>
        </div>
      </form>
    </>
  );
}
