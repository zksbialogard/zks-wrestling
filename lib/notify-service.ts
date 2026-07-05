import { initializeApp, getApps } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { sendEmailMessage, sendSmsMessage } from "./messaging";
import { renderTemplate, type TemplateKey } from "./message-templates";
import {
  createNotificationRecord,
  getMessageTemplate,
} from "./notifications-db";
import { listParentUsersFromDb, upsertParentUsers } from "./parent-users-db";

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

export type ParentUser = {
  uid: string;
  email?: string;
  telefon?: string;
  imie?: string;
  rola?: string;
};

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
};

async function loadParentUsersViaRest(): Promise<ParentUser[]> {
  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users?pageSize=300`,
      {
        headers: {
          "X-Goog-Api-Key": firebaseConfig.apiKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Firestore REST users error:", response.status);
      return [];
    }

    const data = (await response.json()) as {
      documents?: Array<{
        name: string;
        fields?: Record<string, { stringValue?: string }>;
      }>;
    };

    const users: ParentUser[] = [];

    for (const document of data.documents || []) {
      const fields = document.fields || {};
      const uid = fields.uid?.stringValue || document.name.split("/").pop() || "";
      const email = fields.email?.stringValue;
      const rola = fields.rola?.stringValue;

      if (!email || !(rola === "rodzic" || !rola)) {
        continue;
      }

      users.push({
        uid,
        email,
        telefon: fields.telefon?.stringValue,
        imie: fields.imie?.stringValue,
        rola,
      });
    }

    return users;
  } catch (error) {
    console.error("loadParentUsersViaRest:", error);
    return [];
  }
}

export async function loadParentUsers(): Promise<ParentUser[]> {
  const fromSupabase = await listParentUsersFromDb();
  if (fromSupabase.length) {
    return fromSupabase;
  }

  const restUsers = await loadParentUsersViaRest();
  if (restUsers.length) {
    await upsertParentUsers(restUsers);
    return restUsers;
  }

  try {
    const snapshot = await getDocs(collection(getDb(), "users"));

    const sdkUsers = snapshot.docs
      .map((item) => {
        const data = item.data();
        return {
          uid: (data.uid as string) || item.id,
          email: data.email as string | undefined,
          telefon: data.telefon as string | undefined,
          imie: data.imie as string | undefined,
          nazwisko: data.nazwisko as string | undefined,
          rola: data.rola as string | undefined,
        };
      })
      .filter((user) => user.email && (user.rola === "rodzic" || !user.rola));

    if (sdkUsers.length) {
      await upsertParentUsers(sdkUsers);
    }

    return sdkUsers;
  } catch (error) {
    console.error("loadParentUsers:", error);
    return [];
  }
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
        "Nie znaleziono rodziców w Firebase. Powiadomienia w aplikacji wymagają kont rodziców."
      );
      return result;
    }

    const activeChannels = [
      input.channels.email ? "email" : null,
      input.channels.sms ? "sms" : null,
      input.channels.inApp !== false ? "in_app" : null,
      input.channels.push ? "push" : null,
    ].filter(Boolean) as string[];

    for (const parent of parents) {
      try {
        if (input.channels.email && parent.email) {
          const emailResult = await sendEmailMessage({
            to: parent.email,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text,
          });

          if (emailResult.ok) {
            result.emailsSent += 1;
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
          } else if ("error" in smsResult && smsResult.error) {
            result.errors.push(`${parent.telefon}: ${smsResult.error}`);
          }
        }

        if (input.channels.inApp !== false) {
          const created = await createNotificationRecord({
            user_uid: parent.uid,
            type: input.type || input.templateKey,
            title: rendered.pushTitle,
            body: rendered.pushBody,
            link: input.link,
            channels: activeChannels,
          });

          if (created) {
            result.inAppSent += 1;
          }
        }

        if (input.channels.push) {
          result.pushSent += 1;
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

  return result;
}

export async function savePushPreference(uid: string, enabled: boolean) {
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
}
