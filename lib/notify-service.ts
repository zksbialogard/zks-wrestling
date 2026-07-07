import { initializeApp, getApps } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { fetchParentUsersFromFirestore } from "./firebase-parents";
import { coercePhoneValue } from "./messaging";
import { sanitizeNotifyResult } from "./notify-result-utils";
import { renderTemplate, type TemplateKey } from "./message-templates";
import {
  createNotificationRecordsBulk,
  getMessageTemplate,
} from "./notifications-db";
import {
  listParentUsersFromDb,
  listClubMembersFromDb,
  upsertParentUsers,
  type ParentUser,
} from "./parent-users-db";
import { sendWebPushToUsers } from "./web-push-service";

export type { ParentUser };

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

export type NotifyChannels = {
  email?: boolean;
  sms?: boolean;
  inApp?: boolean;
  push?: boolean;
};

export type NotifyResult = {
  totalParents: number;
  emailsSent: number;
  smsSent: number;
  inAppSent: number;
  pushSent: number;
  errors: string[];
  warnings: string[];
};

function resolveAppChannels(channels: NotifyChannels) {
  return {
    inApp: channels.inApp !== false,
    push: channels.push !== false,
  };
}

function mergeParentUsers(...lists: ParentUser[][]) {
  const merged = new Map<string, ParentUser>();

  for (const list of lists) {
    for (const user of list) {
      const existing = merged.get(user.uid);

      if (!existing) {
        merged.set(user.uid, user);
        continue;
      }

      merged.set(user.uid, {
        ...existing,
        ...user,
        email: user.email || existing.email,
        telefon: user.telefon || existing.telefon,
        imie: user.imie || existing.imie,
        rola: user.rola || existing.rola,
      });
    }
  }

  return Array.from(merged.values());
}

async function loadParentUsersFromFirestoreSdk(): Promise<ParentUser[]> {
  try {
    const snapshot = await getDocs(collection(getDb(), "users"));
    const parents: ParentUser[] = [];

    for (const item of snapshot.docs) {
      const data = item.data();
      const uid = (data.uid as string) || item.id;
      const rola = data.rola as string | undefined;

      if (rola !== "rodzic" || !uid) {
        continue;
      }

      parents.push({
        uid,
        email: data.email as string | undefined,
        telefon: coercePhoneValue(data.telefon) || undefined,
        imie: data.imie as string | undefined,
        rola,
      });
    }

    return parents;
  } catch (error) {
    console.error("loadParentUsersFromFirestoreSdk:", error);
    return [];
  }
}

export async function loadParentUsers(): Promise<ParentUser[]> {
  const fromSupabase = await listParentUsersFromDb();
  let fromFirestore = await fetchParentUsersFromFirestore();

  if (!fromFirestore.length) {
    fromFirestore = await loadParentUsersFromFirestoreSdk();
  }

  const parents = mergeParentUsers(fromSupabase, fromFirestore);

  if (parents.length) {
    await upsertParentUsers(parents);
  }

  return parents;
}

async function loadClubMembersFromFirestoreSdk(): Promise<ParentUser[]> {
  try {
    const snapshot = await getDocs(collection(getDb(), "users"));
    const members: ParentUser[] = [];

    for (const item of snapshot.docs) {
      const data = item.data();
      const uid = (data.uid as string) || item.id;
      const rola = data.rola as string | undefined;

      if ((rola !== "rodzic" && rola !== "zawodnik") || !uid) {
        continue;
      }

      members.push({
        uid,
        email: data.email as string | undefined,
        telefon: coercePhoneValue(data.telefon) || undefined,
        imie: data.imie as string | undefined,
        rola,
      });
    }

    return members;
  } catch (error) {
    console.error("loadClubMembersFromFirestoreSdk:", error);
    return [];
  }
}

export function clubMemberDefaultLink(rola?: string, fallbackLink?: string): string {
  if (fallbackLink) {
    return fallbackLink;
  }

  if (rola === "zawodnik") {
    return "/panel-zawodnika/powiadomienia";
  }

  return "/panel-rodzica/powiadomienia";
}

export async function loadClubMembers(): Promise<ParentUser[]> {
  const fromSupabase = await listClubMembersFromDb();
  const fromFirestore = await loadClubMembersFromFirestoreSdk();
  const members = mergeParentUsers(fromSupabase, fromFirestore);

  if (members.length) {
    await upsertParentUsers(members);
  }

  return members;
}

export async function syncAllParentsToSupabase() {
  const parents = await loadParentUsers();
  return {
    count: parents.length,
    parents: parents.map((parent) => ({
      uid: parent.uid,
      email: parent.email,
      imie: parent.imie,
      telefon: parent.telefon,
    })),
  };
}

export async function notifyParents(input: {
  templateKey: TemplateKey;
  variables: Record<string, string>;
  channels: NotifyChannels;
  type?: string;
  link?: string;
  targetUid?: string;
}): Promise<NotifyResult> {
  const result: NotifyResult = {
    totalParents: 0,
    emailsSent: 0,
    smsSent: 0,
    inAppSent: 0,
    pushSent: 0,
    errors: [],
    warnings: [],
  };

  try {
    const channels = resolveAppChannels(input.channels);
    const template = await getMessageTemplate(input.templateKey);
    const rendered = {
      pushTitle: renderTemplate(template.push_title, input.variables),
      pushBody: renderTemplate(template.push_body, input.variables),
    };

    const allParents = await loadParentUsers();
    const parents = input.targetUid
      ? allParents.filter((user) => user.uid === input.targetUid)
      : allParents;

    result.totalParents = parents.length;

    if (!parents.length) {
      result.errors.push(
        "Nie znaleziono rodziców z rolą „rodzic” w Firebase. Sprawdź Admin → Użytkownicy."
      );
      return result;
    }

    const activeChannels = [
      channels.inApp ? "in_app" : null,
      channels.push ? "push" : null,
    ].filter(Boolean) as string[];

    if (channels.inApp) {
      const bulk = await createNotificationRecordsBulk(
        parents.map((parent) => ({
          user_uid: parent.uid,
          type: input.type || input.templateKey,
          title: rendered.pushTitle,
          body: rendered.pushBody,
          link: input.link,
          channels: activeChannels,
        }))
      );

      result.inAppSent = bulk.created;
      result.errors.push(...bulk.errors);

      if (bulk.created < parents.length) {
        result.warnings.push(
          `Zapisano ${bulk.created} z ${parents.length} powiadomień w aplikacji.`
        );
      }
    }

    if (channels.push) {
      const pushResult = await sendWebPushToUsers(
        parents.map((parent) => parent.uid),
        {
          title: rendered.pushTitle,
          body: rendered.pushBody,
          url: input.link || "/panel-rodzica/powiadomienia",
        }
      );

      result.pushSent = pushResult.sent;

      if (pushResult.sent === 0 && pushResult.errors.length) {
        result.warnings.push(...pushResult.errors.slice(0, 2));
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nie udało się wysłać powiadomień.";
    result.errors.push(message);
  }

  return sanitizeNotifyResult(result);
}

export async function notifyClubMembers(input: {
  templateKey: TemplateKey;
  variables: Record<string, string>;
  channels: NotifyChannels;
  type?: string;
  link?: string;
  targetUid?: string;
}): Promise<NotifyResult> {
  const result: NotifyResult = {
    totalParents: 0,
    emailsSent: 0,
    smsSent: 0,
    inAppSent: 0,
    pushSent: 0,
    errors: [],
    warnings: [],
  };

  try {
    const channels = resolveAppChannels(input.channels);
    const template = await getMessageTemplate(input.templateKey);
    const rendered = {
      pushTitle: renderTemplate(template.push_title, input.variables),
      pushBody: renderTemplate(template.push_body, input.variables),
    };

    const allMembers = await loadClubMembers();
    const members = input.targetUid
      ? allMembers.filter((user) => user.uid === input.targetUid)
      : allMembers;

    result.totalParents = members.length;

    if (!members.length) {
      result.errors.push(
        "Nie znaleziono członków klubu (rodzic / zawodnik). Sprawdź Admin → Użytkownicy."
      );
      return result;
    }

    const activeChannels = [
      channels.inApp ? "in_app" : null,
      channels.push ? "push" : null,
    ].filter(Boolean) as string[];

    const urlsByUid = Object.fromEntries(
      members.map((member) => [
        member.uid,
        clubMemberDefaultLink(member.rola, input.link),
      ])
    );

    if (channels.inApp) {
      const bulk = await createNotificationRecordsBulk(
        members.map((member) => ({
          user_uid: member.uid,
          type: input.type || input.templateKey,
          title: rendered.pushTitle,
          body: rendered.pushBody,
          link: urlsByUid[member.uid],
          channels: activeChannels,
        }))
      );

      result.inAppSent = bulk.created;
      result.errors.push(...bulk.errors);

      if (bulk.created < members.length) {
        result.warnings.push(
          `Zapisano ${bulk.created} z ${members.length} powiadomień w aplikacji.`
        );
      }
    }

    if (channels.push) {
      const pushResult = await sendWebPushToUsers(
        members.map((member) => member.uid),
        {
          title: rendered.pushTitle,
          body: rendered.pushBody,
          urlsByUid,
        }
      );

      result.pushSent = pushResult.sent;

      if (pushResult.sent === 0 && pushResult.errors.length) {
        result.warnings.push(...pushResult.errors.slice(0, 2));
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nie udało się wysłać powiadomień.";
    result.errors.push(message);
  }

  return sanitizeNotifyResult(result);
}

export async function savePushPreference(uid: string, enabled: boolean) {
  try {
    const snapshot = await getDocs(
      query(collection(getDb(), "users"), where("uid", "==", uid))
    );

    if (snapshot.empty) {
      return;
    }

    await setDoc(
      snapshot.docs[0].ref,
      {
        pushEnabled: enabled,
        pushUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("savePushPreference:", error);
  }
}
