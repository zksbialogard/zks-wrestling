import { getEventRegistrationStatus } from "./event-utils";
import { getChildForParent, getParentPhone } from "./firebase-children";
import { createSupabaseAdmin } from "./supabase";
import { notifyParents, type NotifyResult } from "./notify-service";
import {
  createRegistration,
  deleteRegistration,
  findRegistrationByEventAndChild,
  getRegistrationById,
  updateRegistrationStatus,
  updateRegistrationData,
} from "./registrations-db";
import type { RegistrationStatus } from "./registration-types";
import { createNotificationRecordsBulk } from "./notifications-db";
import { sendWebPushToUsers } from "./web-push-service";

export async function submitRegistration(input: {
  eventId: string;
  childId: string;
  parentUid: string;
}) {
  const child = await getChildForParent(input.childId, input.parentUid);

  if (!child) {
    throw new Error("Nie znaleziono dziecka przypisanego do Twojego konta.");
  }

  const supabase = createSupabaseAdmin();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", input.eventId)
    .maybeSingle();

  if (error || !event) {
    throw new Error("Nie znaleziono zawodów.");
  }

  if (getEventRegistrationStatus(event) !== "open") {
    throw new Error("Zapisy na te zawody są już zamknięte.");
  }

  const existing = await findRegistrationByEventAndChild(input.eventId, input.childId);

  if (existing) {
    throw new Error("To dziecko jest już zgłoszone na te zawody.");
  }

  const parentPhone = await getParentPhone(input.parentUid);

  const registration = await createRegistration({
    event_id: input.eventId,
    child_id: input.childId,
    parent_uid: input.parentUid,
    child_name: child.imie,
    child_surname: child.nazwisko,
    child_birth_year: child.rokUrodzenia,
    child_gender: child.plec,
    child_weight: child.kategoriaWagowa,
    parent_phone: parentPhone || null,
  });

  const childName = `${child.imie} ${child.nazwisko}`.trim();
  const title = "Zgłoszenie zapisane";
  const body = `${childName} — ${event.title}. Oczekuje na akceptację klubu.`;

  await createNotificationRecordsBulk([
    {
      user_uid: input.parentUid,
      type: "registration",
      title,
      body,
      link: "/panel-rodzica/moje-zgloszenia",
      channels: ["in_app", "push"],
    },
  ]);

  await sendWebPushToUsers([input.parentUid], {
    title,
    body,
    url: "/panel-rodzica/moje-zgloszenia",
  });

  return registration;
}

export type RegistrationStatusUpdateResult = RegistrationRecord & {
  notifyResult?: NotifyResult;
};

export async function changeRegistrationStatus(
  registrationId: string,
  status: RegistrationStatus
): Promise<RegistrationStatusUpdateResult> {
  const registration = await getRegistrationById(registrationId);

  if (!registration) {
    throw new Error("Nie znaleziono zgłoszenia.");
  }

  const ok = await updateRegistrationStatus(registrationId, status);

  if (!ok) {
    throw new Error("Nie udało się zaktualizować statusu zgłoszenia.");
  }

  const supabase = createSupabaseAdmin();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", registration.event_id)
    .maybeSingle();

  if (!event) {
    return { ...registration, status };
  }

  const childName = `${registration.child_name} ${registration.child_surname}`.trim();
  const eventDate = new Date(event.event_date).toLocaleDateString("pl-PL");
  let notifyResult: NotifyResult | undefined;

  if (status === "approved") {
    notifyResult = await notifyParents({
      templateKey: "registration_accepted",
      variables: {
        childName,
        title: event.title,
        location: event.location,
        eventDate,
        link: `/panel-rodzica/moje-zgloszenia`,
      },
      channels: { inApp: true, push: true },
      type: "registration",
      link: "/panel-rodzica/moje-zgloszenia",
      targetUid: registration.parent_uid,
    });
  }

  if (status === "rejected") {
    notifyResult = await notifyParents({
      templateKey: "registration_rejected",
      variables: {
        childName,
        title: event.title,
        location: event.location,
        eventDate,
        link: `/panel-rodzica/moje-zgloszenia`,
      },
      channels: { inApp: true, push: true },
      type: "registration",
      link: "/panel-rodzica/moje-zgloszenia",
      targetUid: registration.parent_uid,
    });
  }

  return { ...registration, status, notifyResult };
}

export type RegistrationDataUpdate = {
  child_name?: string;
  child_surname?: string;
  child_birth_year?: string;
  child_gender?: string;
  child_weight?: string;
  parent_phone?: string | null;
};

export async function updateRegistrationByAdmin(
  registrationId: string,
  data: RegistrationDataUpdate
) {
  const registration = await getRegistrationById(registrationId);

  if (!registration) {
    throw new Error("Nie znaleziono zgłoszenia.");
  }

  const payload = {
    child_name: data.child_name?.trim() || registration.child_name,
    child_surname: data.child_surname?.trim() || registration.child_surname,
    child_birth_year: data.child_birth_year?.trim() || registration.child_birth_year,
    child_gender: data.child_gender?.trim() || registration.child_gender,
    child_weight: data.child_weight?.trim() || registration.child_weight,
    parent_phone:
      data.parent_phone === undefined
        ? registration.parent_phone
        : data.parent_phone?.trim() || null,
  };

  const ok = await updateRegistrationData(registrationId, payload);

  if (!ok) {
    throw new Error("Nie udało się zaktualizować danych zgłoszenia.");
  }

  return { ...registration, ...payload };
}

export async function removeRegistration(registrationId: string) {
  const ok = await deleteRegistration(registrationId);

  if (!ok) {
    throw new Error("Nie udało się usunąć zgłoszenia.");
  }

  return true;
}
