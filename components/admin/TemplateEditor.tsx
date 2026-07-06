"use client";

import { useRef, useState } from "react";
import { Eye, Info, Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";

import { auth } from "@/lib/firebase";
import type { MessageTemplate } from "@/lib/message-templates";
import { estimateSmsParts, smsUsesUnicode } from "@/lib/messaging";
import {
  friendlyToTechnical,
  getVariablesForTemplate,
  TEMPLATE_WHEN,
  technicalToFriendly,
} from "@/lib/template-editor-utils";

export type EditableTemplate = {
  key: MessageTemplate["key"];
  name: string;
  sms_text: string;
  push_title: string;
  push_body: string;
};

type TemplateEditorProps = {
  draft: EditableTemplate;
  saving: boolean;
  parentsWithPhone: number;
  onChange: (draft: EditableTemplate) => void;
  onSave: () => void;
};

type FieldKey = "sms_text" | "push_title" | "push_body";

function VariableChips({
  templateKey,
  onInsert,
}: {
  templateKey: MessageTemplate["key"];
  onInsert: (label: string) => void;
}) {
  const variables = getVariablesForTemplate(templateKey);

  if (variables.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <span className="text-xs text-zks-text-muted">Wstaw dane:</span>
      {variables.map((variable) => (
        <button
          key={variable.key}
          type="button"
          onClick={() => onInsert(`[${variable.label}]`)}
          className="rounded-full border border-zks-gold-mid/25 bg-zks-black px-2.5 py-1 text-xs text-zks-gold-bright transition hover:border-zks-gold-mid/50 hover:bg-zks-gold/10"
        >
          {variable.label}
        </button>
      ))}
    </div>
  );
}

function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-white">{label}</label>
      {hint ? <p className="mb-2 text-xs text-zks-text-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

const fieldClassName =
  "w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none focus:border-zks-gold-mid/60";

function fillPreview(text: string) {
  return technicalToFriendly(text)
    .replace(/\[Tytuł\]/g, "Memoriał ZKS 2026")
    .replace(/\[Miejsce\]/g, "Hala OSiR, Białogard")
    .replace(/\[Data zawodów\]/g, "15.03.2026")
    .replace(/\[Termin zapisów\]/g, "10.03.2026")
    .replace(/\[Imię zawodnika\]/g, "Jan Kowalski")
    .replace(/\[Treść wiadomości\]/g, "Trening odwołany — sala w remoncie.")
    .replace(/\[Treść aktualności\]/g, "Zapraszamy na sparingi w sobotę.")
    .replace(/\[Link do aplikacji\]/g, "zks-wrestling.vercel.app");
}

export default function TemplateEditor({
  draft,
  saving,
  parentsWithPhone,
  onChange,
  onSave,
}: TemplateEditorProps) {
  const [broadcasting, setBroadcasting] = useState(false);
  const refs = {
    sms_text: useRef<HTMLTextAreaElement>(null),
    push_title: useRef<HTMLInputElement>(null),
    push_body: useRef<HTMLInputElement>(null),
  };

  function insertIntoField(field: FieldKey, insertion: string) {
    const input = refs[field].current;

    if (!input) {
      onChange({ ...draft, [field]: `${draft[field]}${insertion}` });
      return;
    }

    const start = input.selectionStart ?? draft[field].length;
    const end = input.selectionEnd ?? draft[field].length;
    const nextValue = draft[field].slice(0, start) + insertion + draft[field].slice(end);

    onChange({ ...draft, [field]: nextValue });

    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + insertion.length;
      input.setSelectionRange(cursor, cursor);
    });
  }

  const previewSms = fillPreview(draft.sms_text);
  const smsParts = estimateSmsParts(previewSms);
  const unicode = smsUsesUnicode(previewSms);

  async function broadcastToAll() {
    const technical = friendlyToTechnical(draft.sms_text).trim();

    if (!technical) {
      toast.error("Uzupełnij treść SMS.");
      return;
    }

    if (/\[[^\]]+\]/.test(draft.sms_text)) {
      toast.error("Usuń placeholdery typu [Tytuł] albo wstaw konkretne dane przed wysyłką.");
      return;
    }

    if (
      !window.confirm(
        `Wyślesz SMS do ${parentsWithPhone} rodziców z numerem telefonu.\n\nTreść:\n${technical}\n\nKoszt: ok. ${smsParts} SMS na osobę. Kontynuować?`
      )
    ) {
      return;
    }

    try {
      setBroadcasting(true);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Brak sesji administratora.");
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/admin/sms/broadcast", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: technical, confirmed: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Nie udało się wysłać SMS.");
      }

      toast.success(result.message);

      if (result.result?.errors?.length) {
        toast.warning(result.result.errors.slice(0, 2).join(" "));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd wysyłki masowej.");
    } finally {
      setBroadcasting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 rounded-xl border border-zks-gold-mid/20 bg-zks-gold/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-zks-gold-bright" />
        <div>
          <p className="text-sm font-medium text-white">Kiedy wysyłany jest ten SMS?</p>
          <p className="mt-1 text-sm text-zks-text-muted">{TEMPLATE_WHEN[draft.key]}</p>
        </div>
      </div>

      <section className="zks-card p-6">
        <h3 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-bold text-white">
          Treść SMS
        </h3>

        <FieldBlock
          label="Wiadomość na telefon rodzica"
          hint="Polskie znaki działają (ą, ę, ó, ł, ś, ź, ż). Przy polskich znakach 1 SMS = max 70 znaków."
        >
          <textarea
            ref={refs.sms_text}
            value={draft.sms_text}
            onChange={(e) => onChange({ ...draft, sms_text: e.target.value })}
            rows={4}
            className={fieldClassName}
            placeholder="np. ZKS: nowe zawody [Tytuł], [Miejsce], [Data zawodów]."
          />
          <VariableChips
            templateKey={draft.key}
            onInsert={(label) => insertIntoField("sms_text", label)}
          />
          <p className="mt-2 text-xs text-zks-text-muted">
            {previewSms.length} znaków · ok. {smsParts} SMS na osobę
            {unicode ? " (polskie znaki)" : ""}
          </p>
        </FieldBlock>
      </section>

      <section className="zks-card p-6">
        <h3 className="mb-1 font-[family-name:var(--font-heading)] text-lg font-bold text-white">
          Powiadomienie w aplikacji
        </h3>
        <p className="mb-4 text-xs text-zks-text-muted">
          To samo zdarzenie — dodatkowo w panelu rodzica (bez kosztu SMS).
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldBlock label="Tytuł">
            <input
              ref={refs.push_title}
              value={draft.push_title}
              onChange={(e) => onChange({ ...draft, push_title: e.target.value })}
              className={fieldClassName}
            />
            <VariableChips
              templateKey={draft.key}
              onInsert={(label) => insertIntoField("push_title", label)}
            />
          </FieldBlock>

          <FieldBlock label="Treść">
            <input
              ref={refs.push_body}
              value={draft.push_body}
              onChange={(e) => onChange({ ...draft, push_body: e.target.value })}
              className={fieldClassName}
            />
            <VariableChips
              templateKey={draft.key}
              onInsert={(label) => insertIntoField("push_body", label)}
            />
          </FieldBlock>
        </div>
      </section>

      <section className="zks-card p-6">
        <div className="mb-3 flex items-center gap-2 text-zks-gold-bright">
          <Eye className="h-4 w-4" />
          <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wide">
            Podgląd SMS
          </h3>
        </div>
        <div className="mx-auto max-w-sm">
          <div className="rounded-2xl border border-zks-gold-mid/20 bg-zks-black p-4">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-zks-text-muted">
              SMS · ZKS Białogard
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">{previewSms}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="zks-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Zapisywanie..." : "Zapisz szablon"}
        </button>

        <button
          type="button"
          disabled={broadcasting || parentsWithPhone === 0}
          onClick={broadcastToAll}
          className="zks-btn-outline inline-flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-60"
        >
          {broadcasting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {broadcasting
            ? "Wysyłanie..."
            : `Wyślij SMS do wszystkich (${parentsWithPhone})`}
        </button>
      </div>
    </div>
  );
}
