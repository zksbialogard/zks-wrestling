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

type FirestoreField = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
};

type UserProfile = {
  uid?: string;
  email?: string;
  rola?: string;
  imie?: string;
  nazwisko?: string;
  telefon?: string;
  [key: string]: unknown;
};

function parseFirestoreFields(
  fields: Record<string, FirestoreField> | undefined
): UserProfile {
  if (!fields) {
    return {};
  }

  const profile: UserProfile = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value.stringValue !== undefined) {
      profile[key] = value.stringValue;
    } else if (value.booleanValue !== undefined) {
      profile[key] = value.booleanValue;
    } else if (value.integerValue !== undefined) {
      profile[key] = Number(value.integerValue);
    }
  }

  return profile;
}

async function getUserProfileViaRest(uid: string): Promise<UserProfile | null> {
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
                value: { stringValue: uid },
              },
            },
            limit: 1,
          },
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Firestore REST profile error:", response.status);
      return null;
    }

    const rows = (await response.json()) as Array<{
      document?: { fields?: Record<string, FirestoreField> };
    }>;

    const document = rows.find((row) => row.document)?.document;

    if (!document?.fields) {
      return null;
    }

    return parseFirestoreFields(document.fields);
  } catch (error) {
    console.error("getUserProfileViaRest:", error);
    return null;
  }
}

export async function verifyFirebaseToken(idToken: string) {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.users?.[0]) {
      return null;
    }

    return data.users[0] as { localId: string; email?: string };
  } catch (error) {
    console.error("verifyFirebaseToken:", error);
    return null;
  }
}

type VerifiedUser = { localId: string; email?: string };

type StaffUser = VerifiedUser & { profile: UserProfile; rola: string };

export async function verifyAdminToken(idToken: string) {
  try {
    const staff = await verifyStaffToken(idToken);

    if (!staff || staff.rola !== "admin") {
      return null;
    }

    return { localId: staff.localId, email: staff.email };
  } catch (error) {
    console.error("verifyAdminToken:", error);
    return null;
  }
}

export async function verifyStaffToken(idToken: string): Promise<StaffUser | null> {
  try {
    const user = await verifyFirebaseToken(idToken);

    if (!user) {
      return null;
    }

    const profile = await getUserProfileViaRest(user.localId);

    if (!profile || (profile.rola !== "admin" && profile.rola !== "moderator")) {
      return null;
    }

    return {
      localId: user.localId,
      email: user.email,
      profile,
      rola: profile.rola,
    };
  } catch (error) {
    console.error("verifyStaffToken:", error);
    return null;
  }
}

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const user = await verifyFirebaseToken(token);

  if (!user) {
    return null;
  }

  const profile = await getUserProfileViaRest(user.localId);

  if (!profile) {
    return null;
  }

  return {
    uid: user.localId,
    email: user.email,
    profile,
  };
}

export async function getAdminFromRequest(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7);
    return await verifyAdminToken(token);
  } catch (error) {
    console.error("getAdminFromRequest:", error);
    return null;
  }
}

export async function getStaffFromRequest(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7);
    return await verifyStaffToken(token);
  } catch (error) {
    console.error("getStaffFromRequest:", error);
    return null;
  }
}
