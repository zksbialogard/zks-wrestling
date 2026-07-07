import { isParentLinkedToChild } from "./children-identity";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCuYZKXiIZytN49RrgGc4gWJQy8fYcUGik",
  projectId: "zks-bialogard",
};

type FirestoreField = {
  stringValue?: string;
  integerValue?: string;
  arrayValue?: { values?: Array<{ stringValue?: string }> };
};

function parseFirestoreFields(fields: Record<string, FirestoreField> | undefined) {
  if (!fields) {
    return {} as Record<string, string | string[]>;
  }

  const result: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value.stringValue !== undefined) {
      result[key] = value.stringValue;
    } else if (value.integerValue !== undefined) {
      result[key] = value.integerValue;
    } else if (value.arrayValue?.values) {
      result[key] = value.arrayValue.values
        .map((item) => item.stringValue)
        .filter((item): item is string => Boolean(item));
    }
  }

  return result;
}

export type VerifiedChild = {
  id: string;
  imie: string;
  nazwisko: string;
  rokUrodzenia: string;
  plec: string;
  kategoriaWagowa: string;
};

export async function getChildForParent(childId: string, parentUid: string) {
  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/children/${encodeURIComponent(childId)}`,
      {
        headers: {
          "X-Goog-Api-Key": firebaseConfig.apiKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const document = (await response.json()) as {
      fields?: Record<string, FirestoreField>;
    };

    const fields = parseFirestoreFields(document.fields);

    const childRecord = {
      parentUid: String(fields.parentUid ?? ""),
      parentUids: Array.isArray(fields.parentUids) ? fields.parentUids : undefined,
    };

    if (!isParentLinkedToChild(childRecord, parentUid)) {
      return null;
    }

    return {
      id: childId,
      imie: String(fields.imie ?? ""),
      nazwisko: String(fields.nazwisko ?? ""),
      rokUrodzenia: String(fields.rokUrodzenia ?? ""),
      plec: String(fields.plec ?? ""),
      kategoriaWagowa: String(fields.kategoriaWagowa ?? ""),
    } satisfies VerifiedChild;
  } catch (error) {
    console.error("getChildForParent:", error);
    return null;
  }
}

export async function getParentPhone(parentUid: string) {
  const profile = await getParentProfile(parentUid);
  return profile.telefon || "";
}

export async function getParentEmail(parentUid: string) {
  const profile = await getParentProfile(parentUid);
  return profile.email || "";
}

async function getParentProfile(parentUid: string) {
  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": firebaseConfig.apiKey,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "users" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "uid" },
                op: "EQUAL",
                value: { stringValue: parentUid },
              },
            },
            limit: 1,
          },
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { email: "", telefon: "" };
    }

    const rows = (await response.json()) as Array<{
      document?: { fields?: Record<string, FirestoreField> };
    }>;

    const document = rows.find((row) => row.document)?.document;
    const fields = parseFirestoreFields(document?.fields);

    return {
      email: fields.email || "",
      telefon: fields.telefon || "",
    };
  } catch (error) {
    console.error("getParentProfile:", error);
    return { email: "", telefon: "" };
  }
}
