import {
  collection,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

import { getParentUids } from "./children-identity";
import { renderTemplate, type TemplateKey } from "./message-templates";
import {
  createNotificationRecordsBulk,
  getMessageTemplate,
} from "./notifications-db";
import type { NotifyChannels, NotifyResult } from "./notify-service";
import { sanitizeNotifyResult } from "./notify-result-utils";
import { sendWebPushToUsers } from "./web-push-service";
import type { TrainingGroupId } from "./training-groups";
import { getTrainingGroupLabel } from "./training-groups";

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

type GroupMember = {
  uid: string;
  imie?: string;
  rola?: string;
};

function trainingNotificationLink(rola?: string): string {
  return rola === "zawodnik" ? "/panel-zawodnika/treningi" : "/panel-rodzica/treningi";
}

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

async function loadGroupMemberUids(groupId: TrainingGroupId): Promise<Set<string>> {
  const db = getDb();
  const uids = new Set<string>();

  const childrenSnapshot = await getDocs(collection(db, "children"));

  for (const item of childrenSnapshot.docs) {
    const data = item.data();
    if (data.grupaTreningowa !== groupId) {
      continue;
    }

    for (const uid of getParentUids(data as { parentUid?: string; parentUids?: string[] })) {
      uids.add(uid);
    }
  }

  const usersSnapshot = await getDocs(collection(db, "users"));

  for (const item of usersSnapshot.docs) {
    const data = item.data();
    if (data.rola !== "zawodnik" || data.grupaTreningowa !== groupId) {
      continue;
    }

    const uid = (data.uid as string) || item.id;
    if (uid) {
      uids.add(uid);
    }
  }

  return uids;
}

async function loadGroupMembers(groupId: TrainingGroupId): Promise<GroupMember[]> {
  const uids = await loadGroupMemberUids(groupId);

  if (!uids.size) {
    return [];
  }

  const db = getDb();
  const snapshot = await getDocs(collection(db, "users"));
  const members: GroupMember[] = [];

  for (const item of snapshot.docs) {
    const data = item.data();
    const uid = (data.uid as string) || item.id;

    if (!uids.has(uid)) {
      continue;
    }

    members.push({
      uid,
      imie: data.imie as string | undefined,
      rola: data.rola as string | undefined,
    });
  }

  return members;
}

export async function notifyTrainingGroup(input: {
  groupId: TrainingGroupId;
  message: string;
  templateKey?: TemplateKey;
  variables?: Record<string, string>;
  channels?: NotifyChannels;
  link?: string;
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
    const templateKey = input.templateKey || "training_cancelled";
    const variables = {
      message: input.message,
      groupName: getTrainingGroupLabel(input.groupId),
      ...input.variables,
    };

    const template = await getMessageTemplate(templateKey);
    const rendered = {
      pushTitle: renderTemplate(template.push_title, variables),
      pushBody: renderTemplate(template.push_body, variables),
    };

    const members = await loadGroupMembers(input.groupId);
    result.totalParents = members.length;

    if (!members.length) {
      result.warnings.push(
        `Brak rodziców i zawodników w grupie ${getTrainingGroupLabel(input.groupId)}.`
      );
      return sanitizeNotifyResult(result);
    }

    const channels = {
      inApp: input.channels?.inApp !== false,
      push: input.channels?.push !== false,
    };

    const activeChannels = [
      channels.inApp ? "in_app" : null,
      channels.push ? "push" : null,
    ].filter(Boolean) as string[];

    const memberUids = members.map((member) => member.uid);
    const urlsByUid = Object.fromEntries(
      members.map((member) => [
        member.uid,
        input.link || trainingNotificationLink(member.rola),
      ])
    );

    if (channels.inApp) {
      const bulk = await createNotificationRecordsBulk(
        members.map((member) => ({
          user_uid: member.uid,
          type: "training_exception",
          title: rendered.pushTitle,
          body: rendered.pushBody,
          link: urlsByUid[member.uid],
          channels: activeChannels,
        }))
      );

      result.inAppSent = bulk.created;
      result.errors.push(...bulk.errors);
    }

    if (channels.push) {
      const pushResult = await sendWebPushToUsers(memberUids, {
        title: rendered.pushTitle,
        body: rendered.pushBody,
        urlsByUid,
      });

      result.pushSent = pushResult.sent;

      if (pushResult.sent === 0 && pushResult.errors.length) {
        result.warnings.push(...pushResult.errors.slice(0, 2));
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nie udało się wysłać powiadomień grupy.";
    result.errors.push(message);
  }

  return sanitizeNotifyResult(result);
}
