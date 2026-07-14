import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import type { VideoRecordInput } from "./video-server";

export async function ensureVideoUploadAuth() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany z uprawnieniami moderatora lub administratora.");
  }

  await user.getIdToken(true);
}

export async function saveVideoToFirestore(input: VideoRecordInput) {
  const docRef = await addDoc(collection(db, "videos"), {
    title: input.title,
    source: input.source,
    url: input.url,
    posterUrl: input.posterUrl,
    youtubeId: input.youtubeId || null,
    storagePath: input.storagePath || null,
    posterStoragePath: input.posterStoragePath || null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteVideoFromFirestore(id: string) {
  await deleteDoc(doc(db, "videos", id));
}
