import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export async function ensureGalleryUploadAuth() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany jako administrator.");
  }

  await user.getIdToken(true);
}

async function getAuthHeader() {
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

export async function saveGalleryPhotoToFirestore(input: {
  title: string;
  url: string;
  thumbUrl?: string;
  storagePath?: string;
  thumbStoragePath?: string;
}) {
  const docRef = await addDoc(collection(db, "gallery"), {
    title: input.title,
    url: input.url,
    thumbUrl: input.thumbUrl || null,
    storagePath: input.storagePath || null,
    thumbStoragePath: input.thumbStoragePath || null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteGalleryPhotoFromFirestore(id: string) {
  await deleteDoc(doc(db, "gallery", id));
}

export async function notifyGalleryPhotoPublished(title: string) {
  const headers = await getAuthHeader();

  const response = await fetch("/api/admin/gallery/notify", {
    method: "POST",
    headers,
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      (result as { error?: string }).error ||
        "Zdjęcie zapisane, ale powiadomienia mogły nie zostać wysłane."
    );
  }
}
