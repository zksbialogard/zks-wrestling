import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDocsFromServer,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";
import { normalizeNewsImages } from "./news-images";

export type FirebaseNewsItem = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  source: "firebase";
  images?: { url: string; storagePath?: string }[];
};

export async function getFirebaseNews(options?: {
  fromServer?: boolean;
}): Promise<FirebaseNewsItem[]> {
  try {
    const newsQuery = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const snapshot = options?.fromServer
      ? await getDocsFromServer(newsQuery)
      : await getDocs(newsQuery);

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
        images: normalizeNewsImages(data.images),
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
  images?: { url: string; storagePath?: string }[];
}) {
  await addDoc(collection(db, "news"), {
    title: data.title,
    content: data.content,
    images: data.images || [],
    createdAt: serverTimestamp(),
  });
}

export async function updateFirebaseNews(
  id: string,
  data: {
    title: string;
    content: string;
    images?: { url: string; storagePath?: string }[];
  }
) {
  await updateDoc(doc(db, "news", id), {
    title: data.title,
    content: data.content,
    ...(data.images !== undefined ? { images: data.images } : {}),
  });
}

export async function deleteFirebaseNews(id: string) {
  await deleteDoc(doc(db, "news", id));
}
