import { getEventRegistrationStatus } from "./event-utils";
import { getChildForParent, getParentPhone } from "./firebase-children";
import { createSupabaseAdmin } from "./supabase";
import { notifyParents } from "./notify-service";
import {
  createRegistration,
  deleteRegistration,
  findRegistrationByEventAndChild,
  getRegistrationById,
  updateRegistrationStatus,
} from "./registrations-db";
import type { RegistrationStatus } from "./registration-types";
import { sendSmsMessage } from "./messaging";

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

  if (parentPhone) {
    await sendSmsMessage({
      phone: parentPhone,
      message: `ZKS Białogard: zgloszenie ${child.imie} ${child.nazwisko} na "${event.title}" zapisane. Oczekuje na akceptacje klubu.`,
    });
  }

  return registration;
}

export async function changeRegistrationStatus(
  registrationId: string,
  status: RegistrationStatus
) {
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
    return registration;
  }

  const childName = `${registration.child_name} ${registration.child_surname}`.trim();
  const eventDate = new Date(event.event_date).toLocaleDateString("pl-PL");
  const parentPhone =
    registration.parent_phone || (await getParentPhone(registration.parent_uid)) || "";

  if (status === "approved") {
    await notifyParents({
      templateKey: "registration_accepted",
      variables: {
        childName,
        title: event.title,
        location: event.location,
        eventDate,
        link: `/panel-rodzica/moje-zgloszenia`,
      },
      channels: { sms: Boolean(parentPhone), inApp: true, push: true },
      type: "registration",
      link: "/panel-rodzica/moje-zgloszenia",
      targetUid: registration.parent_uid,
    });
  }

  if (status === "rejected") {
    await notifyParents({
      templateKey: "registration_rejected",
      variables: {
        childName,
        title: event.title,
        location: event.location,
        eventDate,
        link: `/panel-rodzica/moje-zgloszenia`,
      },
      channels: { sms: Boolean(parentPhone), inApp: true, push: true },
      type: "registration",
      link: "/panel-rodzica/moje-zgloszenia",
      targetUid: registration.parent_uid,
    });
  }

  return { ...registration, status };
}

export async function removeRegistration(registrationId: string) {
  const ok = await deleteRegistration(registrationId);

  if (!ok) {
    throw new Error("Nie udało się usunąć zgłoszenia.");
  }

  return true;
}
