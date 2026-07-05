import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export type FirebaseNewsItem = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  source: "firebase";
};

export async function getFirebaseNews(): Promise<FirebaseNewsItem[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, "news"), orderBy("createdAt", "desc"))
    );

    return snapshot.docs.map((item) => {
      const data = item.data();
      const createdAt = data.createdAt?.seconds
        ? new Date(data.createdAt.seconds * 1000).toISOString()
        : undefined;

      return {
        id: item.id,
        title: data.title || "",
        content: data.content || "",
        created_at: createdAt,
        source: "firebase" as const,
      };
    });
  } catch (error) {
    console.error("Firebase news read error:", error);
    return [];
  }
}

export async function createFirebaseNews(data: {
  title: string;
  content: string;
}) {
  await addDoc(collection(db, "news"), {
    title: data.title,
    content: data.content,
    createdAt: serverTimestamp(),
  });
}

export async function updateFirebaseNews(
  id: string,
  data: { title: string; content: string }
) {
  await updateDoc(doc(db, "news", id), {
    title: data.title,
    content: data.content,
  });
}

export async function deleteFirebaseNews(id: string) {
  await deleteDoc(doc(db, "news", id));
}
