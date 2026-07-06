import { initializeApp, getApps } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import type { GalleryItem } from "./gallery-types";

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

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const snapshot = await getDocs(
      query(collection(getDb(), "gallery"), orderBy("createdAt", "desc"))
    );

    return snapshot.docs.map((item) => {
      const data = item.data();
      const createdAt = data.createdAt?.seconds
        ? new Date(data.createdAt.seconds * 1000).toISOString()
        : undefined;

      return {
        id: item.id,
        title: (data.title as string) || "",
        url: (data.url as string) || "",
        thumbUrl: data.thumbUrl as string | undefined,
        storagePath: data.storagePath as string | undefined,
        thumbStoragePath: data.thumbStoragePath as string | undefined,
        createdAt,
      };
    });
  } catch (error) {
    console.error("getGalleryItems:", error);
    return [];
  }
}

export async function addGalleryItem(input: {
  title: string;
  url: string;
  storagePath?: string;
  thumbUrl?: string;
  thumbStoragePath?: string;
}) {
  const docRef = await addDoc(collection(getDb(), "gallery"), {
    title: input.title,
    url: input.url,
    thumbUrl: input.thumbUrl || null,
    storagePath: input.storagePath || null,
    thumbStoragePath: input.thumbStoragePath || null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteGalleryItem(id: string) {
  await deleteDoc(doc(getDb(), "gallery", id));
}
