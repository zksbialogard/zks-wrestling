"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
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
import { auth, db } from "@/lib/firebase";
import {
  formatEventDate,
  getEventRegistrationStatus,
} from "@/lib/event-utils";
import { fetchEventById, type Event } from "@/lib/events";

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
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
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
        setLoadingChildren(false);
        return;
      }

      await loadChildren(user.uid);
    });

    return () => unsubscribe();
  }, []);

  const loadChildren = async (uid: string) => {
    try {
      setLoadingChildren(true);

      const q = query(collection(db, "children"), where("parentUid", "==", uid));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Child, "id">),
      }));

      setChildren(data);
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się pobrać listy dzieci.");
    } finally {
      setLoadingChildren(false);
    }
  };

  const registerChild = async (child: Child) => {
    if (!event) {
      return;
    }

    const status = getEventRegistrationStatus(event);

    if (status !== "open") {
      toast.error("Zapisy na te zawody są już zamknięte.");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error("Musisz być zalogowany, aby zgłosić dziecko.");
        return;
      }

      setRegisteringId(child.id);

      const userSnapshot = await getDocs(
        query(collection(db, "users"), where("uid", "==", user.uid))
      );

      let parentPhone = "";

      if (!userSnapshot.empty) {
        parentPhone = userSnapshot.docs[0].data().telefon || "";
      }

      await addDoc(collection(db, "registrations"), {
        eventId,
        childId: child.id,
        childName: child.imie,
        childSurname: child.nazwisko,
        childBirthYear: child.rokUrodzenia,
        childGender: child.plec,
        childWeight: child.kategoriaWagowa,
        parentUid: user.uid,
        parentPhone,
        status: "pending",
        createdAt: new Date(),
      });

      if (parentPhone) {
        await fetch("/api/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: parentPhone,
            message: `ZKS Białogard: zgłoszenie ${child.imie} ${child.nazwisko} na zawody „${event.title}” zostało zapisane.`,
          }),
        });
      }

      toast.success(`${child.imie} ${child.nazwisko} zgłoszone na „${event.title}”.`);
    } catch (error) {
      console.error(error);
      toast.error("Błąd podczas zgłoszenia.");
    } finally {
      setRegisteringId(null);
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
            <p className="mt-3 text-zks-text-muted">
              Te zawody mogły zostać usunięte lub link jest nieaktualny.
            </p>
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

        <div className="mt-8">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
            Wybierz dziecko
          </h2>
          <p className="mt-2 text-sm text-zks-text-muted">
            Zgłoś zawodnika na zawody „{event.title}”.
          </p>
        </div>

        {!isLoggedIn ? (
          <div className="zks-card mt-6 rounded-2xl p-8 text-center">
            <UserRound className="mx-auto h-10 w-10 text-zks-gold-mid" />
            <p className="mt-4 text-zks-text-muted">
              Zaloguj się jako rodzic, aby zgłosić dziecko na zawody.
            </p>
            <Link
              href="/login"
              className="zks-btn-primary mt-6 inline-flex px-6 py-3 text-sm"
            >
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
            {children.map((child) => (
              <article
                key={child.id}
                className="zks-card rounded-2xl p-5 transition hover:border-zks-gold-mid/40"
              >
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
                  {child.imie} {child.nazwisko}
                </h3>

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

                <button
                  type="button"
                  disabled={!canRegister || registeringId === child.id}
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
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
