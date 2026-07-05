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

export async function loadParentUsers(): Promise<ParentUser[]> {
  const snapshot = await getDocs(collection(getDb(), "users"));

  return snapshot.docs
    .map((item) => {
      const data = item.data();
      return {
        uid: (data.uid as string) || item.id,
        email: data.email as string | undefined,
        telefon: data.telefon as string | undefined,
        imie: data.imie as string | undefined,
        rola: data.rola as string | undefined,
      };
    })
    .filter((user) => user.email && (user.rola === "rodzic" || !user.rola));
}

export async function notifyParents(input: {
  templateKey: TemplateKey;
  variables: Record<string, string>;
  channels: NotifyChannels;
  type?: string;
  link?: string;
  targetUid?: string;
}): Promise<NotifyResult> {
  const template = await getMessageTemplate(input.templateKey);
  const rendered = {
    subject: renderTemplate(template.subject, input.variables),
    text: renderTemplate(template.body_text, input.variables),
    html: renderTemplate(template.body_html, input.variables),
    sms: renderTemplate(template.sms_text, input.variables),
    pushTitle: renderTemplate(template.push_title, input.variables),
    pushBody: renderTemplate(template.push_body, input.variables),
  };

  const parents = input.targetUid
    ? (await loadParentUsers()).filter((user) => user.uid === input.targetUid)
    : await loadParentUsers();

  const result: NotifyResult = {
    totalParents: parents.length,
    emailsSent: 0,
    smsSent: 0,
    inAppSent: 0,
    pushSent: 0,
    errors: [],
  };

  const activeChannels = [
    input.channels.email ? "email" : null,
    input.channels.sms ? "sms" : null,
    input.channels.inApp !== false ? "in_app" : null,
    input.channels.push ? "push" : null,
  ].filter(Boolean) as string[];

  for (const parent of parents) {
    try {
      if (input.channels.email && parent.email) {
        await sendEmailMessage({
          to: parent.email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        });
        result.emailsSent += 1;
      }

      if (input.channels.sms && parent.telefon) {
        const smsResult = await sendSmsMessage({
          phone: parent.telefon,
          message: rendered.sms,
        });

        if (smsResult.ok) {
          result.smsSent += 1;
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
