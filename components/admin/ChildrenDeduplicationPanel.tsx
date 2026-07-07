"use client";

import { useState } from "react";
import { GitMerge, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";

type DeduplicationPreview = {
  totalChildren: number;
  duplicateDocs: number;
  duplicateGroups: Array<{
    canonicalId: string;
    duplicateIds: string[];
    label: string;
    parentUids: string[];
  }>;
};

type DeduplicationRunResult = DeduplicationPreview & {
  mergedGroups: number;
  deletedDocs: number;
  registrationsRemapped: number;
  registrationsRemoved: number;
  resultsRemapped: number;
  errors: string[];
};

export default function ChildrenDeduplicationPanel() {
  const { user } = useAuth();
  const [preview, setPreview] = useState<DeduplicationPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [running, setRunning] = useState(false);

  const loadPreview = async () => {
    if (!user) return;

    setLoadingPreview(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/children/deduplicate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Nie udało się sprawdzić duplikatów.");
      }

      setPreview(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się sprawdzić duplikatów.";
      toast.error(message);
    } finally {
      setLoadingPreview(false);
    }
  };

  const runMigration = async () => {
    if (!user || !preview?.duplicateDocs) return;

    if (
      !confirm(
        `Scal ${preview.duplicateDocs} duplikatów w ${preview.duplicateGroups.length} grupach? Operacji nie można cofnąć.`
      )
    ) {
      return;
    }

    setRunning(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/children/deduplicate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = (await response.json()) as DeduplicationRunResult & { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Migracja nie powiodła się.");
      }

      setPreview(result);

      toast.success(
        `Scalono ${result.mergedGroups} grup, usunięto ${result.deletedDocs} duplikatów.`
      );

      if (result.errors.length) {
        toast.warning(`Część operacji zakończyła się błędem (${result.errors.length}).`);
      }

      window.location.reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Migracja nie powiodła się.";
      toast.error(message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="zks-card mb-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
            Migracja duplikatów
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zks-text-muted">
            Scala zduplikowane profile tego samego zawodnika (np. dodane przez dwóch rodziców),
            łączy konta rodziców, przepina zgłoszenia i wyniki, a następnie usuwa zbędne wpisy.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPreview}
          disabled={loadingPreview || running}
          className="inline-flex items-center gap-2 rounded-lg border border-zks-gold-mid/30 px-4 py-2 text-sm text-zks-gold-bright transition hover:border-zks-gold-mid/60"
        >
          {loadingPreview ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Sprawdź duplikaty
        </button>
      </div>

      {preview ? (
        <div className="mt-5 rounded-xl border border-zks-gold-mid/20 bg-zks-black/40 p-4">
          <p className="text-sm text-zks-text">
            Zawodników w bazie: <strong>{preview.totalChildren}</strong>
          </p>
          <p className="mt-1 text-sm text-zks-text">
            Duplikatów do usunięcia:{" "}
            <strong className={preview.duplicateDocs ? "text-amber-300" : "text-emerald-300"}>
              {preview.duplicateDocs}
            </strong>
          </p>

          {preview.duplicateGroups.length ? (
            <ul className="mt-4 space-y-2 text-sm text-zks-text-muted">
              {preview.duplicateGroups.map((group) => (
                <li key={group.canonicalId}>
                  {group.label} — {group.duplicateIds.length} duplikat(y), rodzice:{" "}
                  {group.parentUids.length}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-emerald-300">Brak duplikatów do scalenia.</p>
          )}

          {preview.duplicateDocs > 0 ? (
            <button
              type="button"
              onClick={runMigration}
              disabled={running}
              className="zks-btn-primary mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GitMerge className="h-4 w-4" />
              )}
              {running ? "Scalanie..." : "Scal duplikaty w bazie"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
