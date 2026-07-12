import { deleteField, doc, getDoc, updateDoc } from "firebase/firestore";

import { isUserRole } from "./user-roles";
import { getServerFirestore } from "./firestore-server";
import type { TrainingGroupId } from "./training-groups";

export type FirestoreUserRecord = {
  id: string;
  uid?: string;
  email?: string;
  telefon?: string;
  imie?: string;
  nazwisko?: string;
  rola?: string;
  grupaTreningowa?: TrainingGroupId;
};

export async function getFirestoreUser(userDocId: string): Promise<FirestoreUserRecord | null> {
  const snapshot = await getDoc(doc(getServerFirestore(), "users", userDocId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<FirestoreUserRecord, "id">),
  };
}

export async function updateUserRole(userDocId: string, rola: string) {
  if (!isUserRole(rola)) {
    throw new Error("Nieprawidłowa rola użytkownika.");
  }

  const existing = await getFirestoreUser(userDocId);

  if (!existing) {
    throw new Error("Nie znaleziono użytkownika.");
  }

  const updates: Record<string, unknown> = {
    rola,
    updatedAt: new Date(),
  };

  if (rola === "zawodnik") {
    if (!existing.grupaTreningowa) {
      updates.grupaTreningowa = "srednia";
    }
  } else {
    updates.grupaTreningowa = deleteField();
  }

  await updateDoc(doc(getServerFirestore(), "users", userDocId), updates);

  return {
    ...existing,
    rola,
    grupaTreningowa: rola === "zawodnik" ? existing.grupaTreningowa || "srednia" : undefined,
  };
}
