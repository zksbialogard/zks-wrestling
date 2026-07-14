"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  CheckSquare,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Square,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PlacePicker from "@/components/admin/PlacePicker";
import AuthField from "@/components/auth/AuthField";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { formatEventDate } from "@/lib/event-utils";
import { joinAthleteName, splitAthleteName } from "@/lib/athlete-name-utils";
import { clubPlaceLabel, placeLabel } from "@/lib/place-utils";
import {
  createAdminFacebookResult,
  deleteAdminFacebookEventGroup,
  deleteAdminFacebookResult,
  deleteAdminFacebookResults,
  fetchAdminFacebookResults,
  syncAdminFacebookResults,
  updateAdminFacebookEventGroup,
  updateAdminFacebookResult,
  type FacebookResultFormData,
} from "@/lib/facebook-results-admin-client";
import type { FacebookEventResults, FacebookResultRecord } from "@/lib/facebook-results-types";

const DEFAULT_RESULTS_YEAR = 2026;

const EMPTY_FORM: FacebookResultFormData = {
  event_title: "",
  event_date: "",
  location: "",
  athlete_name: "",
  weight_class: "",
  style: "",
  place: null,
  year: DEFAULT_RESULTS_YEAR,
  source_url: "",
  published: true,
};

type EventGroupForm = {
  event_title: string;
  event_date: string;
  location: string;
  source_url: string;
  year: number;
  club_place: number | null;
  club_points: string;
};

type ResultNameForm = {
  firstName: string;
  lastName: string;
};

function buildEventCardKey(event: FacebookEventResults) {
  return `${event.facebook_post_id}::${event.event_title}`;
}

export default function FacebookResultsAdminPage() {
  const [year, setYear] = useState(DEFAULT_RESULTS_YEAR);
  const [events, setEvents] = useState<FacebookEventResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<FacebookResultRecord | null>(null);
  const [form, setForm] = useState<FacebookResultFormData>(EMPTY_FORM);
  const [nameForm, setNameForm] = useState<ResultNameForm>({ firstName: "", lastName: "" });
  const [facebookPostId, setFacebookPostId] = useState("");

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FacebookEventResults | null>(null);
  const [eventForm, setEventForm] = useState<EventGroupForm>({
    event_title: "",
    event_date: "",
    location: "",
    source_url: "",
    year: DEFAULT_RESULTS_YEAR,
    club_place: null,
    club_points: "",
  });

  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "result"; id: string; label: string }
    | { type: "bulk"; ids: string[]; label: string }
    | { type: "event"; facebookPostId: string; eventTitle: string; label: string }
    | null
  >(null);

  const [selectionModeEventKey, setSelectionModeEventKey] = useState<string | null>(null);
  const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(new Set());

  const loadResults = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await fetchAdminFacebookResults(year);
      setEvents(data);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Nie udało się wczytać wyników.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const resetResultForm = () => {
    setForm({ ...EMPTY_FORM, year });
    setNameForm({ firstName: "", lastName: "" });
    setFacebookPostId("");
    setEditingResult(null);
    setResultModalOpen(false);
  };

  const openAddResult = (event?: FacebookEventResults) => {
    setEditingResult(null);
    setForm({
      ...EMPTY_FORM,
      year,
      event_title: event?.event_title || "",
      event_date: event?.event_date || "",
      location: event?.location || "",
      source_url: event?.source_url || "",
    });
    setNameForm({ firstName: "", lastName: "" });
    setFacebookPostId(event?.facebook_post_id || "");
    setResultModalOpen(true);
  };

  const openEditResult = (result: FacebookResultRecord, event: FacebookEventResults) => {
    const { firstName, lastName } = splitAthleteName(result.athlete_name);

    setEditingResult(result);
    setForm({
      event_title: event.event_title,
      event_date: event.event_date || "",
      location: event.location || "",
      athlete_name: result.athlete_name,
      weight_class: result.weight_class || "",
      style: result.style || "",
      place: result.place,
      year: result.year,
      source_url: event.source_url || "",
      published: result.published,
    });
    setNameForm({ firstName, lastName });
    setFacebookPostId(event.facebook_post_id);
    setResultModalOpen(true);
  };

  const openEditEvent = (event: FacebookEventResults) => {
    exitSelectionMode();
    setEditingEvent(event);
    setEventForm({
      event_title: event.event_title,
      event_date: event.event_date || "",
      location: event.location || "",
      source_url: event.source_url || "",
      year: event.results[0]?.year || year,
      club_place: event.club_place ?? null,
      club_points: event.club_points || "",
    });
    setEventModalOpen(true);
  };

  const saveResult = async () => {
    const athleteName = joinAthleteName(nameForm.firstName, nameForm.lastName);

    if (!athleteName || !form.event_title.trim()) {
      toast.error("Uzupełnij imię i nazwisko zawodnika oraz nazwę zawodów.");
      return;
    }

    setSaving(true);

    try {
      const payload: FacebookResultFormData = {
        ...form,
        athlete_name: athleteName,
        facebook_post_id: facebookPostId || undefined,
        place: form.place ? Number(form.place) : null,
      };

      if (editingResult) {
        await updateAdminFacebookResult(editingResult.id, payload);
        toast.success("Wynik zaktualizowany.");
      } else {
        await createAdminFacebookResult(payload);
        toast.success("Wynik dodany.");
      }

      resetResultForm();
      await loadResults(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zapisać wyniku.");
    } finally {
      setSaving(false);
    }
  };

  const saveEventGroup = async () => {
    if (!editingEvent || !eventForm.event_title.trim()) {
      toast.error("Nazwa zawodów jest wymagana.");
      return;
    }

    setSaving(true);

    try {
      await updateAdminFacebookEventGroup(
        editingEvent.facebook_post_id,
        editingEvent.event_title,
        {
          event_title: eventForm.event_title,
          event_date: eventForm.event_date || undefined,
          location: eventForm.location,
          source_url: eventForm.source_url || undefined,
          year: eventForm.year,
          club_place: eventForm.club_place,
          club_points: eventForm.club_points || undefined,
        }
      );

      toast.success("Dane zawodów zaktualizowane.");
      setEventModalOpen(false);
      setEditingEvent(null);
      await loadResults(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nie udało się zaktualizować zawodów.";
      if (message.includes("migracji 013")) {
        toast.warning(message);
        setEventModalOpen(false);
        setEditingEvent(null);
        await loadResults(false);
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      let newsAction: string | undefined;

      if (deleteTarget.type === "result") {
        const result = await deleteAdminFacebookResult(deleteTarget.id);
        newsAction = result.news?.action;
        toast.success("Wynik usunięty.");
      } else if (deleteTarget.type === "bulk") {
        const result = await deleteAdminFacebookResults(deleteTarget.ids);
        newsAction = result.news?.action;
        toast.success(
          result.deletedCount === 1
            ? "Usunięto 1 wynik."
            : `Usunięto ${result.deletedCount} wyników.`
        );
        exitSelectionMode();
      } else {
        const result = await deleteAdminFacebookEventGroup(
          deleteTarget.facebookPostId,
          deleteTarget.eventTitle
        );
        newsAction = result.news?.action;
        toast.success("Zawody i wszystkie wyniki usunięte.");
        exitSelectionMode();
      }

      if (newsAction === "deleted") {
        toast.success("Powiązana aktualność została usunięta.");
      } else if (newsAction === "updated") {
        toast.success("Powiązana aktualność została zaktualizowana.");
      }

      setDeleteTarget(null);
      await loadResults(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć.");
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await syncAdminFacebookResults(year);
      const sources = Array.isArray(result.sources) ? result.sources.join(", ") : "—";
      toast.success(
        `Zsynchronizowano: ${result.parsedRows || 0} wyników, ${result.news?.created || 0} nowych aktualności (${sources}).`
      );
      await loadResults(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Synchronizacja nie powiodła się.");
    } finally {
      setSyncing(false);
    }
  };

  const totalResults = events.reduce((sum, event) => sum + event.results.length, 0);

  const exitSelectionMode = () => {
    setSelectionModeEventKey(null);
    setSelectedResultIds(new Set());
  };

  const toggleSelectionMode = (event: FacebookEventResults) => {
    const eventKey = buildEventCardKey(event);

    if (selectionModeEventKey === eventKey) {
      exitSelectionMode();
      return;
    }

    setSelectionModeEventKey(eventKey);
    setSelectedResultIds(new Set());
  };

  const toggleResultSelection = (resultId: string) => {
    setSelectedResultIds((current) => {
      const next = new Set(current);
      if (next.has(resultId)) {
        next.delete(resultId);
      } else {
        next.add(resultId);
      }
      return next;
    });
  };

  const selectAllInEvent = (event: FacebookEventResults) => {
    setSelectedResultIds(new Set(event.results.map((result) => result.id)));
  };

  const requestBulkDelete = (event: FacebookEventResults) => {
    const ids = event.results
      .map((result) => result.id)
      .filter((id) => selectedResultIds.has(id));

    if (!ids.length) {
      toast.error("Zaznacz co najmniej jeden wynik do usunięcia.");
      return;
    }

    const labels = event.results
      .filter((result) => selectedResultIds.has(result.id))
      .map((result) => `${result.athlete_name} (${placeLabel(result.place)})`)
      .slice(0, 5);

    const suffix =
      ids.length > labels.length ? ` i ${ids.length - labels.length} więcej` : "";

    setDeleteTarget({
      type: "bulk",
      ids,
      label: `${labels.join(", ")}${suffix}`,
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Wyniki zawodów"
        description="Zarządzaj wynikami widocznymi na stronie klubu. Dane z Facebooka i wpisy dodane ręcznie."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zks-text-muted">
          Sezon
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-zks-gold-mid/30 bg-zks-black px-3 py-2 text-white outline-none focus:border-zks-gold-mid"
          >
            {[2026, 2025, 2024].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={async () => {
            await handleSync();
            await loadResults(false);
          }}
          disabled={syncing || loading}
          className="zks-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Pobieranie..." : "Pobierz z Facebooka"}
        </button>

        <button
          type="button"
          onClick={() => loadResults()}
          disabled={syncing}
          className="zks-btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
        >
          Odśwież listę
        </button>

        <button
          type="button"
          onClick={() => openAddResult()}
          className="zks-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" />
          Dodaj wynik
        </button>
      </div>

      <p className="mb-4 text-sm text-zks-text-muted">
        {events.length} zawodów · {totalResults} wyników w sezonie {year}
      </p>

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie...</p>
      ) : events.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">
          Brak wyników w sezonie {year}. Dodaj pierwszy wynik lub zaimportuj dane z seeda.
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => {
            const eventKey = buildEventCardKey(event);
            const isSelecting = selectionModeEventKey === eventKey;
            const selectedCount = event.results.filter((result) =>
              selectedResultIds.has(result.id)
            ).length;
            const allSelected =
              event.results.length > 0 && selectedCount === event.results.length;

            return (
            <article key={eventKey} className="zks-card p-6">
              <div className="flex flex-col gap-4 border-b border-zks-gold-mid/15 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <Trophy className="mt-1 h-5 w-5 shrink-0 text-zks-gold-bright" />
                  <div>
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
                      {event.event_title}
                    </h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-zks-text-muted">
                      <Calendar className="inline h-3.5 w-3.5" />
                      {event.event_date
                        ? formatEventDate(event.event_date)
                        : "Data w trakcie uzupełniania"}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                    {event.source_url && (
                      <a
                        href={event.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-xs text-zks-gold-bright underline-offset-2 hover:underline"
                      >
                        Źródło
                      </a>
                    )}
                    {event.club_place && (
                      <p className="mt-2 text-sm font-medium text-zks-gold-bright">
                        Klasyfikacja klubowa: {clubPlaceLabel(event.club_place)}
                        {event.club_points ? ` · ${event.club_points} pkt` : ""}
                      </p>
                    )}
                    {event.news_post_id && (
                      <p className="mt-1 text-xs text-zks-text-muted">
                        Aktualność opublikowana automatycznie
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openAddResult(event)}
                    disabled={isSelecting}
                    className="zks-btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Wynik
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSelectionMode(event)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs ${
                      isSelecting ? "zks-btn-primary" : "zks-btn-outline"
                    }`}
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    {isSelecting ? "Anuluj wybór" : "Edytuj wyniki"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditEvent(event)}
                    disabled={isSelecting}
                    className="zks-btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edytuj zawody
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        type: "event",
                        facebookPostId: event.facebook_post_id,
                        eventTitle: event.event_title,
                        label: event.event_title,
                      })
                    }
                    disabled={isSelecting}
                    className="zks-btn-danger-outline inline-flex items-center gap-1.5 px-4 py-2 text-xs disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Usuń zawody
                  </button>
                </div>
              </div>

              {isSelecting && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zks-gold-mid/25 bg-zks-gold/5 px-4 py-3">
                  <p className="text-sm text-zks-text-muted">
                    Zaznacz wyniki do usunięcia ({selectedCount}/{event.results.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        allSelected ? setSelectedResultIds(new Set()) : selectAllInEvent(event)
                      }
                      className="zks-btn-outline px-3 py-1.5 text-xs"
                    >
                      {allSelected ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
                    </button>
                    <button
                      type="button"
                      onClick={() => requestBulkDelete(event)}
                      disabled={selectedCount === 0}
                      className="zks-btn-danger-outline inline-flex items-center gap-1.5 px-4 py-2 text-xs disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Usuń zaznaczone{selectedCount > 0 ? ` (${selectedCount})` : ""}
                    </button>
                  </div>
                </div>
              )}

              <ul className="mt-4 space-y-2">
                {event.results.map((result) => {
                  const isSelected = selectedResultIds.has(result.id);

                  return (
                  <li
                    key={result.id}
                    className={`flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                      isSelecting && isSelected
                        ? "border-zks-gold-mid/40 bg-zks-gold/10"
                        : "border-zks-gold-mid/10 bg-zks-black/40"
                    }`}
                  >
                    <div className="flex items-start gap-3 text-sm">
                      {isSelecting && (
                        <button
                          type="button"
                          onClick={() => toggleResultSelection(result.id)}
                          className="mt-0.5 shrink-0 text-zks-gold-bright"
                          aria-label={
                            isSelected
                              ? `Odznacz wynik ${result.athlete_name}`
                              : `Zaznacz wynik ${result.athlete_name}`
                          }
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      )}
                      <div>
                      <span className="font-medium text-white">{result.athlete_name}</span>
                      {result.weight_class && (
                        <span className="ml-2 text-zks-text-muted">({result.weight_class} kg)</span>
                      )}
                      {result.style && (
                        <span className="ml-2 text-xs text-zks-text-muted">{result.style}</span>
                      )}
                      {!result.published && (
                        <span className="ml-2 rounded bg-zks-gold/20 px-1.5 py-0.5 text-[10px] uppercase text-zks-gold-bright">
                          Ukryty
                        </span>
                      )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zks-gold-bright">
                        {placeLabel(result.place)}
                      </span>
                      {!isSelecting && (
                        <>
                      <button
                        type="button"
                        onClick={() => openEditResult(result, event)}
                        className="zks-btn-outline inline-flex items-center gap-1 px-2.5 py-1 text-xs"
                        aria-label="Edytuj wynik zawodnika"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edytuj wynik
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: "result",
                            id: result.id,
                            label: `${result.athlete_name} — ${placeLabel(result.place)}`,
                          })
                        }
                        className="zks-btn-danger-ghost p-2"
                        aria-label="Usuń wynik"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                        </>
                      )}
                    </div>
                  </li>
                  );
                })}
              </ul>
            </article>
            );
          })}
        </div>
      )}

      {resultModalOpen && (
        <Modal open>
          <ModalHeader>
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
                {editingResult ? "Edytuj wynik zawodnika" : "Nowy wynik zawodnika"}
              </h2>
              <button
                type="button"
                onClick={resetResultForm}
                className="rounded-lg p-1 text-zks-text-muted hover:text-white"
                aria-label="Zamknij"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <AuthField
              label="Nazwa zawodów *"
              value={form.event_title}
              onChange={(e) => setForm((prev) => ({ ...prev, event_title: e.target.value }))}
              placeholder="Np. Mistrzostwa Polski U15"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label="Data zawodów"
                type="date"
                value={form.event_date || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, event_date: e.target.value }))}
              />
              <AuthField
                label="Miejsce"
                value={form.location || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Np. Białogard"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label="Imię *"
                value={nameForm.firstName}
                onChange={(e) =>
                  setNameForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                placeholder="Np. Jan"
              />
              <AuthField
                label="Nazwisko *"
                value={nameForm.lastName}
                onChange={(e) =>
                  setNameForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                placeholder="Np. Kowalski"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PlacePicker
                value={form.place ?? null}
                onChange={(place) => setForm((prev) => ({ ...prev, place }))}
                label="Miejsce zawodnika"
              />
              <AuthField
                label="Kategoria wagowa (kg)"
                value={form.weight_class || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, weight_class: e.target.value }))}
                placeholder="Np. 57"
              />
            </div>

            <AuthField
              label="Styl"
              value={form.style || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, style: e.target.value }))}
              placeholder="Np. styl wolny"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label="Rok sezonu *"
                type="number"
                value={form.year}
                onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
              />
              <AuthField
                label="Link do źródła"
                value={form.source_url || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, source_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.published ?? true}
                onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                className="h-4 w-4 accent-zks-gold"
              />
              <span className="text-sm text-zks-text">Opublikowany (widoczny na stronie)</span>
            </label>

            {!editingResult && (
              <p className="text-xs text-zks-text-muted">
                Po dodaniu opublikowanego wyniku system automatycznie utworzy aktualność i wyśle
                powiadomienia push (raz na zawody).
              </p>
            )}
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={resetResultForm} className="zks-btn-outline px-5 py-2">
              Anuluj
            </button>
            <button
              type="button"
              onClick={saveResult}
              disabled={saving}
              className="zks-btn-primary inline-flex items-center gap-2 px-5 py-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingResult ? "Zapisz" : "Dodaj"}
            </button>
          </ModalFooter>
        </Modal>
      )}

      {eventModalOpen && editingEvent && (
        <Modal open>
          <ModalHeader>
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
                Edytuj zawody
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEventModalOpen(false);
                  setEditingEvent(null);
                }}
                className="rounded-lg p-1 text-zks-text-muted hover:text-white"
                aria-label="Zamknij"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <AuthField
              label="Nazwa zawodów *"
              value={eventForm.event_title}
              onChange={(e) => setEventForm((prev) => ({ ...prev, event_title: e.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label="Data"
                type="date"
                value={eventForm.event_date}
                onChange={(e) => setEventForm((prev) => ({ ...prev, event_date: e.target.value }))}
              />
              <AuthField
                label="Lokalizacja"
                value={eventForm.location}
                onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <AuthField
              label="Link do źródła"
              value={eventForm.source_url}
              onChange={(e) => setEventForm((prev) => ({ ...prev, source_url: e.target.value }))}
            />
            <AuthField
              label="Rok sezonu"
              type="number"
              value={eventForm.year}
              onChange={(e) => setEventForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
            />

            <div className="rounded-xl border border-zks-gold-mid/15 bg-zks-black/30 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Klasyfikacja klubowa</h3>
              <p className="mb-3 text-xs text-zks-text-muted">
                Imię i nazwisko zawodnika edytujesz przyciskiem „Edytuj wynik” przy konkretnym
                wyniku na liście — nie w tym oknie.
              </p>
              <PlacePicker
                value={eventForm.club_place}
                onChange={(club_place) => setEventForm((prev) => ({ ...prev, club_place }))}
                label="Miejsce klubu w klasyfikacji"
                allowEmpty
              />
              <div className="mt-4">
                <AuthField
                  label="Punkty klubowe"
                  value={eventForm.club_points}
                  onChange={(e) =>
                    setEventForm((prev) => ({ ...prev, club_points: e.target.value }))
                  }
                  placeholder="Np. 125"
                />
              </div>
            </div>

            <p className="text-xs text-zks-text-muted">
              Zmiany zostaną zastosowane do wszystkich wyników w tej grupie zawodów (
              {editingEvent.results.length} wpisów).
            </p>
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={() => {
                setEventModalOpen(false);
                setEditingEvent(null);
              }}
              className="zks-btn-outline px-5 py-2"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={saveEventGroup}
              disabled={saving}
              className="zks-btn-primary inline-flex items-center gap-2 px-5 py-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Zapisz
            </button>
          </ModalFooter>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={
            deleteTarget.type === "result"
              ? "Usunąć wynik?"
              : deleteTarget.type === "bulk"
                ? "Usunąć zaznaczone wyniki?"
                : "Usunąć zawody?"
          }
          description={
            deleteTarget.type === "result"
              ? `Czy na pewno chcesz usunąć wynik: ${deleteTarget.label}?`
              : deleteTarget.type === "bulk"
                ? `Czy na pewno chcesz usunąć ${deleteTarget.ids.length} wyników: ${deleteTarget.label}? Tej operacji nie można cofnąć.`
                : `Czy na pewno chcesz usunąć wszystkie wyniki zawodów „${deleteTarget.label}"? Tej operacji nie można cofnąć.`
          }
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
