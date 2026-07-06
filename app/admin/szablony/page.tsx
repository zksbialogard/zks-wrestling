"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SmsSettingsCard from "@/components/admin/SmsSettingsCard";
import TemplateEditor, { type EditableTemplate } from "@/components/admin/TemplateEditor";
import { auth } from "@/lib/firebase";
import type { MessageTemplate } from "@/lib/message-templates";
import { friendlyToTechnical, technicalToFriendly } from "@/lib/template-editor-utils";

function toEditableTemplate(template: MessageTemplate): EditableTemplate {
  return {
    key: template.key,
    name: template.name,
    sms_text: technicalToFriendly(template.sms_text),
    push_title: technicalToFriendly(template.push_title),
    push_body: technicalToFriendly(template.push_body),
  };
}

function mergeSavedTemplate(
  original: MessageTemplate,
  draft: EditableTemplate
): MessageTemplate {
  return {
    ...original,
    name: draft.name,
    sms_text: friendlyToTechnical(draft.sms_text),
    push_title: friendlyToTechnical(draft.push_title),
    push_body: friendlyToTechnical(draft.push_body),
  };
}

export default function AdminSzablonyPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [draft, setDraft] = useState<EditableTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parentsWithPhone, setParentsWithPhone] = useState(0);

  useEffect(() => {
    loadTemplates();
    loadSmsStatus();
  }, []);

  async function loadSmsStatus() {
    try {
      const response = await fetch("/api/admin/sms");
      const result = await response.json();
      setParentsWithPhone(result.parentsWithPhone || 0);
    } catch {
      setParentsWithPhone(0);
    }
  }

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
      setDraft(result.templates[0] ? toEditableTemplate(result.templates[0]) : null);
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
    setDraft(template ? toEditableTemplate(template) : null);
  }

  async function saveTemplate() {
    if (!draft) return;

    const original = templates.find((item) => item.key === draft.key);

    if (!original) {
      toast.error("Nie znaleziono szablonu do zapisu.");
      return;
    }

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
        body: JSON.stringify(mergeSavedTemplate(original, draft)),
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
        title="Szablony SMS"
        description="Szablony powiadomień — domyślnie aplikacja + push. SMS opcjonalnie po aktywacji SMSAPI."
      />

      <SmsSettingsCard />

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie szablonów...</p>
      ) : !draft ? (
        <div className="zks-card p-8 text-zks-text-muted">Brak szablonów.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="zks-card h-fit p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-zks-gold-mid">
              Rodzaj wiadomości
            </p>
            <div className="space-y-1">
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

          <TemplateEditor
            draft={draft}
            saving={saving}
            parentsWithPhone={parentsWithPhone}
            onChange={setDraft}
            onSave={saveTemplate}
          />
        </div>
      )}
    </>
  );
}
