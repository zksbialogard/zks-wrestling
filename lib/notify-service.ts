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
import { sanitizeNotifyResult } from "./notify-result-utils";
import { sendEmailMessage, sendSmsMessage } from "./messaging";
import { renderTemplate, type TemplateKey } from "./message-templates";
import {
  createNotificationRecordsBulk,
  getMessageTemplate,
} from "./notifications-db";
import {
  listParentUsersFromDb,
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
        telefon: data.telefon as string | undefined,
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
    const template = await getMessageTemplate(input.templateKey);
    const rendered = {
      subject: renderTemplate(template.subject, input.variables),
      text: renderTemplate(template.body_text, input.variables),
      html: renderTemplate(template.body_html, input.variables),
      sms: renderTemplate(template.sms_text, input.variables),
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
        "Nie znaleziono rodziców z rolą „rodzic” w Firebase. Sprawdź Admin → Rodzice."
      );
      return result;
    }

    const activeChannels = [
      input.channels.email ? "email" : null,
      input.channels.sms ? "sms" : null,
      input.channels.inApp !== false ? "in_app" : null,
      input.channels.push ? "push" : null,
    ].filter(Boolean) as string[];

    const inAppOnly =
      input.channels.inApp !== false &&
      !input.channels.email &&
      !input.channels.sms;

    if (inAppOnly) {
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

      if (bulk.created < parents.length) {
        result.warnings.push(
          `Zapisano ${bulk.created} z ${parents.length} powiadomień w aplikacji.`
        );
      }

      return sanitizeNotifyResult(result);
    }

    for (const parent of parents) {
      try {
        if (input.channels.email && parent.email) {
          const emailResult = await sendEmailMessage({
            to: parent.email,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text,
          });

          if (emailResult.ok && !emailResult.simulated) {
            result.emailsSent += 1;
          } else if (emailResult.simulated) {
            result.warnings.push(
              `${parent.email}: brak RESEND_API_KEY — email nie wysłany.`
            );
          } else if ("error" in emailResult && emailResult.error) {
            result.errors.push(`${parent.email}: ${emailResult.error}`);
          }
        }

        if (input.channels.sms && parent.telefon) {
          const smsResult = await sendSmsMessage({
            phone: parent.telefon,
            message: rendered.sms,
          });

          if (smsResult.ok) {
            result.smsSent += 1;
          } else if (smsResult.skipped) {
            result.warnings.push(`${parent.telefon}: brak SMSAPI_TOKEN.`);
          } else if ("error" in smsResult && smsResult.error) {
            result.errors.push(`${parent.telefon}: ${smsResult.error}`);
          }
        }

        if (input.channels.inApp !== false) {
          const bulk = await createNotificationRecordsBulk([
            {
              user_uid: parent.uid,
              type: input.type || input.templateKey,
              title: rendered.pushTitle,
              body: rendered.pushBody,
              link: input.link,
              channels: activeChannels,
            },
          ]);

          if (bulk.created) {
            result.inAppSent += 1;
          } else if (bulk.errors.length) {
            result.errors.push(`${parent.imie || parent.uid}: ${bulk.errors[0]}`);
          }
        }

        if (input.channels.push) {
          const pushResult = await sendWebPushToUsers([parent.uid], {
            title: rendered.pushTitle,
            body: rendered.pushBody,
            url: input.link || "/panel-rodzica/powiadomienia",
          });

          result.pushSent += pushResult.sent;

          if (pushResult.sent === 0 && pushResult.errors.length) {
            result.warnings.push(...pushResult.errors.slice(0, 1));
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Nieznany błąd powiadomienia.";
        result.errors.push(`${parent.email || parent.uid}: ${message}`);
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
