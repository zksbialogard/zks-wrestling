import type { ParentUser } from "./parent-users-db";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCuYZKXiIZytN49RrgGc4gWJQy8fYcUGik",
  projectId: "zks-bialogard",
};

type FirestoreField = {
  stringValue?: string;
};

function parseParentFromDocument(document: {
  name: string;
  fields?: Record<string, FirestoreField>;
}): ParentUser | null {
  const fields = document.fields || {};
  const uid = fields.uid?.stringValue?.trim();
  const rola = fields.rola?.stringValue?.trim();

  if (!uid || rola !== "rodzic") {
    return null;
  }

  return {
    uid,
    email: fields.email?.stringValue,
    telefon: fields.telefon?.stringValue,
    imie: fields.imie?.stringValue,
    rola,
  };
}

export async function fetchParentUsersFromFirestore(): Promise<ParentUser[]> {
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
                field: { fieldPath: "rola" },
                op: "EQUAL",
                value: { stringValue: "rodzic" },
              },
            },
          },
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("fetchParentUsersFromFirestore:", response.status);
      return [];
    }

    const rows = (await response.json()) as Array<{
      document?: {
        name: string;
        fields?: Record<string, FirestoreField>;
      };
    }>;

    const parents: ParentUser[] = [];

    for (const row of rows) {
      if (!row.document) {
        continue;
      }

      const parent = parseParentFromDocument(row.document);

      if (parent) {
        parents.push(parent);
      }
    }

    return parents;
  } catch (error) {
    console.error("fetchParentUsersFromFirestore:", error);
    return [];
  }
}
