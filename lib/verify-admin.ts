import { initializeApp, getApps } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

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

export async function verifyFirebaseToken(idToken: string) {
  const apiKey = firebaseConfig.apiKey;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.users?.[0]) {
    return null;
  }

  return data.users[0] as { localId: string; email?: string };
}

export async function verifyAdminToken(idToken: string) {
  const user = await verifyFirebaseToken(idToken);

  if (!user) {
    return null;
  }

  const snapshot = await getDocs(
    query(collection(getDb(), "users"), where("uid", "==", user.localId))
  );

  if (snapshot.empty) {
    return null;
  }

  const profile = snapshot.docs[0].data();

  if (profile.rola !== "admin") {
    return null;
  }

  return user;
}

export async function getAdminFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return verifyAdminToken(token);
}
