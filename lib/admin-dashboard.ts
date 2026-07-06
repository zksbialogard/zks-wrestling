import { initializeApp, getApps } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

import {
  formatEventDate,
  getEventRegistrationStatus,
  type EventRegistrationStatus,
} from "./event-utils";
import type { Event } from "./events";
import { getEvents } from "./events-server";
import { listAllRegistrations } from "./registrations-db";
import { normalizeRegistrationStatus } from "./registration-types";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCuYZKXiIZytN49RrgGc4gWJQy8fYcUGik",
  authDomain: "zks-bialogard.firebaseapp.com",
  projectId: "zks-bialogard",
  storageBucket: "zks-bialogard.firebasestorage.app",
  messagingSenderId: "897189660264",
  appId: "1:897189660264:web:c337a84238c4d7e80f1ddd",
};

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export type AdminDashboardEvent = {
  id: string;
  title: string;
  location: string;
  dateLabel: string;
  registrationStatus: EventRegistrationStatus;
  athleteCount: number;
  pendingCount: number;
};

export type AdminDashboardStats = {
  athleteCount: number;
  parentCount: number;
  athleteAccountCount: number;
  upcomingEventCount: number;
  pendingRegistrationCount: number;
  upcomingEvents: AdminDashboardEvent[];
};

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function buildEventSummaries(events: Event[], registrations: Awaited<ReturnType<typeof listAllRegistrations>>) {
  const today = startOfToday();

  const upcoming = events
    .filter((event) => {
      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today && getEventRegistrationStatus(event) !== "finished";
    })
    .slice(0, 5);

  return upcoming.map((event) => {
    const eventRegistrations = registrations.filter((item) => item.event_id === event.id);
    const pendingCount = eventRegistrations.filter(
      (item) => normalizeRegistrationStatus(item.status) === "pending"
    ).length;
    const athleteCount = eventRegistrations.filter(
      (item) => normalizeRegistrationStatus(item.status) === "approved"
    ).length;

    return {
      id: event.id,
      title: event.title,
      location: event.location,
      dateLabel: formatEventDate(event.event_date),
      registrationStatus: getEventRegistrationStatus(event),
      athleteCount,
      pendingCount,
    };
  });
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const db = getDb();
  const today = startOfToday();

  const [childrenSnapshot, usersSnapshot, events, registrations] = await Promise.all([
    getDocs(collection(db, "children")),
    getDocs(collection(db, "users")),
    getEvents(),
    listAllRegistrations(),
  ]);

  let parentCount = 0;
  let athleteAccountCount = 0;

  for (const item of usersSnapshot.docs) {
    const rola = item.data().rola as string | undefined;

    if (rola === "rodzic") {
      parentCount += 1;
    } else if (rola === "zawodnik") {
      athleteAccountCount += 1;
    }
  }

  const upcomingEventCount = events.filter((event) => {
    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today && getEventRegistrationStatus(event) !== "finished";
  }).length;

  const pendingRegistrationCount = registrations.filter(
    (item) => normalizeRegistrationStatus(item.status) === "pending"
  ).length;

  return {
    athleteCount: childrenSnapshot.size,
    parentCount,
    athleteAccountCount,
    upcomingEventCount,
    pendingRegistrationCount,
    upcomingEvents: buildEventSummaries(events, registrations),
  };
}
