"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { auth } from "@/lib/firebase";

type Props = {
  onImported?: () => void | Promise<void>;
};

export default function ImportPlan2026Button({ onImported }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleImport(replaceSeason: boolean) {
    const user = auth.currentUser;

    if (!user) {
      toast.error("Musisz być zalogowany jako administrator.");
      return;
    }

    if (
      replaceSeason &&
      !window.confirm(
        "To usunie wszystkie imprezy sezonu 2026 i zaimportuje plan od nowa. Kontynuować?"
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/events/import-plan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ replaceSeason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Import nie powiódł się.");
      }

      toast.success(
        `Plan 2026: dodano ${result.result.inserted}, pominięto ${result.result.skipped}.`
      );

      if (result.result.errors?.length) {
        toast.warning(result.result.errors.slice(0, 2).join(" "));
      }

      await onImported?.();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Import nie powiódł się.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => handleImport(false)}
        className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-xs disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
        Importuj plan 2026
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleImport(true)}
        className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-xs text-red-300 disabled:opacity-60"
      >
        Nadpisz sezon 2026
      </button>
    </div>
  );
}
