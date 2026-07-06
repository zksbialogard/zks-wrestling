"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EmailSettingsCard from "@/components/admin/EmailSettingsCard";
import { auth } from "@/lib/firebase";
import type { MessageTemplate } from "@/lib/message-templates";

export default function AdminSzablonyPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [draft, setDraft] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Brak sesji administratora.");
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/admin/templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Nie udało się pobrać szablonów.");
      }

      setTemplates(result.templates);
      setSelectedKey(result.templates[0]?.key || "");
      setDraft(result.templates[0] || null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się pobrać szablonów.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function selectTemplate(key: string) {
    const template = templates.find((item) => item.key === key) || null;
    setSelectedKey(key);
    setDraft(template);
  }

  async function saveTemplate() {
    if (!draft) return;

    try {
      setSaving(true);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Brak sesji administratora.");
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Nie udało się zapisać szablonu.");
      }

      toast.success("Szablon zapisany.");
      await loadTemplates();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się zapisać szablonu.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Szablony wiadomości"
        description="Edytuj treści e-mail, SMS i powiadomień w aplikacji. Użyj zmiennych: {{title}}, {{location}}, {{eventDate}}, {{registrationDeadline}}, {{childName}}, {{message}}, {{content}}, {{link}}."
      />

      <EmailSettingsCard />

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie szablonów...</p>
      ) : !draft ? (
        <div className="zks-card p-8 text-zks-text-muted">Brak szablonów.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="zks-card p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-zks-gold-mid">
              Szablony
            </p>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => selectTemplate(template.key)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                    selectedKey === template.key
                      ? "bg-zks-gold/15 text-zks-gold-bright"
                      : "text-zks-text hover:bg-zks-black"
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </aside>

          <div className="zks-card space-y-4 p-6">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
                Nazwa szablonu
              </label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
                Temat e-mail
              </label>
              <input
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
                Treść SMS
              </label>
              <textarea
                value={draft.sms_text}
                onChange={(e) => setDraft({ ...draft, sms_text: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
                Treść e-mail (HTML)
              </label>
              <textarea
                value={draft.body_html}
                onChange={(e) => setDraft({ ...draft, body_html: e.target.value })}
                rows={6}
                className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
                  Tytuł powiadomienia
                </label>
                <input
                  value={draft.push_title}
                  onChange={(e) => setDraft({ ...draft, push_title: e.target.value })}
                  className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
                  Treść powiadomienia
                </label>
                <input
                  value={draft.push_body}
                  onChange={(e) => setDraft({ ...draft, push_body: e.target.value })}
                  className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={saveTemplate}
              className="zks-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Zapisywanie..." : "Zapisz szablon"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
