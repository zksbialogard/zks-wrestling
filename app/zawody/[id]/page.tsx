"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  MapPin,
  Timer,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import EventsLoadingState from "@/components/events/EventsLoadingState";
import PublicEventStatusBadge from "@/components/events/PublicEventStatusBadge";
import { loadChildrenForParent } from "@/lib/children-client";
import { auth, db } from "@/lib/firebase";
import {
  formatEventDate,
  getEventRegistrationStatus,
} from "@/lib/event-utils";
import { fetchEventById, type Event } from "@/lib/events";
import {
  registrationStatusLabel,
  normalizeRegistrationStatus,
} from "@/lib/registration-types";
import {
  fetchRegistrationsForEvent,
  submitRegistration,
  type RegistrationItem,
} from "@/lib/registrations-client";

interface Child {
  id: string;
  imie: string;
  nazwisko: string;
  rokUrodzenia: string;
  plec: string;
  kategoriaWagowa: string;
}

export default function ZgloszenieNaZawodyPage() {
  const params = useParams();
  const eventId = String(params.id);

  const [event, setEvent] = useState<Event | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [bulkRegistering, setBulkRegistering] = useState(false);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await fetchEventById(eventId);
        setEvent(data);
      } catch (error) {
        console.error(error);
      } finally {
        setEventLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(Boolean(user));

      if (!user) {
        setChildren([]);
        setRegistrations([]);
        setLoadingChildren(false);
        return;
      }

      await Promise.all([loadChildren(user.uid), loadRegistrations()]);
    });

    return () => unsubscribe();
  }, [eventId]);

  const loadChildren = async (uid: string) => {
    try {
      setLoadingChildren(true);

      const list = await loadChildrenForParent(db, uid);

      const data = list.map((item) => ({
        id: item.id,
        imie: item.imie,
        nazwisko: item.nazwisko,
        rokUrodzenia: item.rokUrodzenia,
        plec: item.plec ?? "",
        kategoriaWagowa: item.kategoriaWagowa ?? "",
        parentUid: item.parentUid ?? uid,
        grupaTreningowa: item.grupaTreningowa,
      }));

      setChildren(data);
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się pobrać listy dzieci.");
    } finally {
      setLoadingChildren(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const data = await fetchRegistrationsForEvent(eventId);
      setRegistrations(data);
    } catch {
      setRegistrations([]);
    }
  };

  const getChildRegistration = (childId: string) =>
    registrations.find((item) => item.child_id === childId);

  const registerChild = async (child: Child) => {
    if (!event) {
      return;
    }

    if (getEventRegistrationStatus(event) !== "open") {
      toast.error("Zapisy na te zawody są już zamknięte.");
      return;
    }

    if (getChildRegistration(child.id)) {
      toast.info("To dziecko jest już zgłoszone.");
      return;
    }

    try {
      setRegisteringId(child.id);
      await submitRegistration(eventId, child.id);
      await loadRegistrations();
      toast.success(`${child.imie} ${child.nazwisko} zgłoszone na „${event.title}”.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Błąd podczas zgłoszenia.";
      toast.error(message);
    } finally {
      setRegisteringId(null);
    }
  };

  const unregisteredChildren = children.filter((child) => !getChildRegistration(child.id));

  const toggleChildSelection = (childId: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]
    );
  };

  const registerMany = async (childIds: string[]) => {
    if (!event || !childIds.length) {
      return;
    }

    if (getEventRegistrationStatus(event) !== "open") {
      toast.error("Zapisy na te zawody są już zamknięte.");
      return;
    }

    try {
      setBulkRegistering(true);
      let successCount = 0;

      for (const childId of childIds) {
        if (getChildRegistration(childId)) {
          continue;
        }

        await submitRegistration(eventId, childId);
        successCount += 1;
      }

      await loadRegistrations();
      setSelectedChildIds([]);

      if (successCount === 0) {
        toast.info("Wybrane dzieci są już zgłoszone.");
      } else if (successCount === 1) {
        toast.success("Zgłoszono 1 dziecko na zawody.");
      } else {
        toast.success(`Zgłoszono ${successCount} dzieci na zawody.`);
      }
    } catch (error) {
      await loadRegistrations();
      const message =
        error instanceof Error ? error.message : "Błąd podczas zgłaszania dzieci.";
      toast.error(message);
    } finally {
      setBulkRegistering(false);
    }
  };

  if (eventLoading) {
    return (
      <main className="min-h-screen px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <EventsLoadingState />
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="zks-card rounded-2xl p-10">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase text-white">
              Nie znaleziono zawodów
            </h1>
            <Link
              href="/zawody"
              className="zks-btn-primary mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do listy zawodów
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const registrationStatus = getEventRegistrationStatus(event);
  const canRegister = registrationStatus === "open";

  return (
    <main className="relative min-h-screen overflow-hidden pb-20">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-zks-gold/10 blur-[120px]" />

      <section className="relative mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/zawody"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zks-text-muted transition hover:text-zks-gold-bright"
        >
          <ArrowLeft className="h-4 w-4" />
          Wróć do zawodów
        </Link>

        <div className="zks-card rounded-2xl p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="zks-label text-[10px]">Zgłoszenie na zawody</p>
            <PublicEventStatusBadge status={registrationStatus} />
          </div>

          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase text-white sm:text-4xl">
            {event.title}
          </h1>

          <ul className="mt-6 space-y-3 text-sm text-zks-text sm:text-base">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-mid" />
              <span>{event.location}</span>
            </li>
            <li className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-mid" />
              <span>Data zawodów: {formatEventDate(event.event_date)}</span>
            </li>
            <li className="flex items-start gap-3">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-mid" />
              <span>Zapisy do: {formatEventDate(event.registration_deadline)}</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
              Wybierz dzieci
            </h2>
            <p className="mt-2 text-sm text-zks-text-muted">
              Możesz zgłosić jedno dziecko albo kilka naraz na zawody „{event.title}”.
            </p>
          </div>

          {canRegister && unregisteredChildren.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={bulkRegistering}
                onClick={() =>
                  registerMany(unregisteredChildren.map((child) => child.id))
                }
                className="zks-btn-primary px-4 py-2.5 text-xs disabled:opacity-60"
              >
                {bulkRegistering ? "Zgłaszanie..." : "Zgłoś wszystkie dzieci"}
              </button>
              {selectedChildIds.length > 0 && (
                <button
                  type="button"
                  disabled={bulkRegistering}
                  onClick={() => registerMany(selectedChildIds)}
                  className="zks-btn-outline px-4 py-2.5 text-xs disabled:opacity-60"
                >
                  Zgłoś zaznaczone ({selectedChildIds.length})
                </button>
              )}
            </div>
          )}
        </div>

        {!isLoggedIn ? (
          <div className="zks-card mt-6 rounded-2xl p-8 text-center">
            <UserRound className="mx-auto h-10 w-10 text-zks-gold-mid" />
            <p className="mt-4 text-zks-text-muted">
              Zaloguj się jako rodzic, aby zgłosić dziecko na zawody.
            </p>
            <Link href="/login" className="zks-btn-primary mt-6 inline-flex px-6 py-3 text-sm">
              Zaloguj się
            </Link>
          </div>
        ) : loadingChildren ? (
          <div className="mt-6">
            <EventsLoadingState />
          </div>
        ) : children.length === 0 ? (
          <div className="zks-card mt-6 rounded-2xl p-8 text-center">
            <p className="text-zks-text-muted">
              Nie masz jeszcze dodanych dzieci w profilu rodzica.
            </p>
            <Link
              href="/panel-rodzica/moje-dzieci"
              className="zks-btn-outline mt-6 inline-flex px-6 py-3 text-sm"
            >
              Dodaj dziecko
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {children.map((child) => {
              const existing = getChildRegistration(child.id);
              const status = existing
                ? normalizeRegistrationStatus(existing.status)
                : null;

              return (
                <article
                  key={child.id}
                  className={`zks-card rounded-2xl p-5 transition hover:border-zks-gold-mid/40 ${
                    selectedChildIds.includes(child.id) ? "border-zks-gold-bright/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
                      {child.imie} {child.nazwisko}
                    </h3>
                    {!existing && canRegister && unregisteredChildren.length > 1 && (
                      <label className="flex items-center gap-2 text-xs text-zks-text-muted">
                        <input
                          type="checkbox"
                          checked={selectedChildIds.includes(child.id)}
                          onChange={() => toggleChildSelection(child.id)}
                          className="accent-zks-gold"
                        />
                        Zaznacz
                      </label>
                    )}
                  </div>

                  <dl className="mt-4 space-y-2 text-sm text-zks-text-muted">
                    <div className="flex justify-between gap-4">
                      <dt>Rok urodzenia</dt>
                      <dd className="text-zks-text">{child.rokUrodzenia}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Płeć</dt>
                      <dd className="text-zks-text">{child.plec}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Kategoria wagowa</dt>
                      <dd className="text-zks-text">{child.kategoriaWagowa} kg</dd>
                    </div>
                  </dl>

                  {existing ? (
                    <p
                      className={`mt-5 rounded-lg border px-4 py-3 text-center text-xs font-bold uppercase tracking-wide ${
                        status === "approved"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : status === "rejected"
                            ? "border-red-500/30 bg-red-500/10 text-red-400"
                            : "border-zks-gold-mid/30 bg-zks-gold/10 text-zks-gold-bright"
                      }`}
                    >
                      {registrationStatusLabel(existing.status)}
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={!canRegister || registeringId === child.id || bulkRegistering}
                      onClick={() => registerChild(child)}
                      className="zks-btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {registeringId === child.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Zgłaszanie...
                        </>
                      ) : canRegister ? (
                        "Zgłoś na zawody"
                      ) : (
                        "Zapisy zamknięte"
                      )}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
