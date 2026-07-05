import { collection, getDocs } from "firebase/firestore";

import { auth, db } from "./firebase";

async function getAdminAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany jako administrator.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function syncParentsFromFirebaseToSupabase() {
  const snapshot = await getDocs(collection(db, "users"));
  const parents = snapshot.docs
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
    .filter((user) => user.uid && user.rola === "rodzic");

  if (!parents.length) {
    throw new Error("W Firebase nie ma użytkowników z rolą „rodzic”.");
  }

  const headers = await getAdminAuthHeader();
  const response = await fetch("/api/admin/parents/import", {
    method: "POST",
    headers,
    body: JSON.stringify({ parents }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zsynchronizować rodziców.");
  }

  return result.count as number;
}
