"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link2, Unlink } from "lucide-react";

import { linkParentToChild, unlinkParentFromChild } from "@/lib/children-client";
import { db } from "@/lib/firebase";

type ParentOption = {
  uid: string;
  label: string;
};

type ChildParentLinksProps = {
  childId: string;
  parentUids: string[];
  parents: ParentOption[];
  onChanged: () => Promise<void> | void;
};

export default function ChildParentLinks({
  childId,
  parentUids,
  parents,
  onChanged,
}: ChildParentLinksProps) {
  const [selectedParentUid, setSelectedParentUid] = useState("");
  const [saving, setSaving] = useState(false);

  const parentLabelByUid = useMemo(() => {
    return new Map(parents.map((parent) => [parent.uid, parent.label]));
  }, [parents]);

  const availableParents = parents.filter((parent) => !parentUids.includes(parent.uid));

  const linkParent = async () => {
    if (!selectedParentUid) {
      toast.error("Wybierz rodzica z listy.");
      return;
    }

    try {
      setSaving(true);
      await linkParentToChild(db, childId, selectedParentUid);
      toast.success("Rodzic przypisany do zawodnika.");
      setSelectedParentUid("");
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się przypisać rodzica.");
    } finally {
      setSaving(false);
    }
  };

  const unlinkParent = async (parentUid: string) => {
    if (!confirm("Odpiąć tego rodzica od zawodnika?")) return;

    try {
      setSaving(true);
      await unlinkParentFromChild(db, childId, parentUid);
      toast.success("Rodzic odpięty.");
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się odpiąć rodzica.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-zks-gold-mid/15 bg-zks-black/40 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
        Przypisani rodzice
      </p>

      {parentUids.length ? (
        <ul className="mt-3 space-y-2">
          {parentUids.map((parentUid) => (
            <li
              key={parentUid}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zks-gold-mid/10 px-3 py-2 text-sm text-zks-text"
            >
              <span>
                {parentLabelByUid.get(parentUid) || "Nieznany rodzic"}{" "}
                <span className="text-xs text-zks-text-muted">({parentUid})</span>
              </span>
              <button
                type="button"
                disabled={saving}
                onClick={() => unlinkParent(parentUid)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1 text-xs text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                <Unlink className="h-3.5 w-3.5" />
                Odepnij
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-zks-text-muted">Brak przypisanych rodziców.</p>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Dodaj rodzica
          </span>
          <select
            value={selectedParentUid}
            disabled={saving || availableParents.length === 0}
            onChange={(e) => setSelectedParentUid(e.target.value)}
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-3 py-2.5 text-sm text-white outline-none disabled:opacity-60"
          >
            <option value="">
              {availableParents.length ? "Wybierz rodzica..." : "Wszyscy rodzice są już przypisani"}
            </option>
            {availableParents.map((parent) => (
              <option key={parent.uid} value={parent.uid}>
                {parent.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={saving || !selectedParentUid}
          onClick={linkParent}
          className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
        >
          <Link2 className="h-4 w-4" />
          Przypisz rodzica
        </button>
      </div>
    </div>
  );
}
