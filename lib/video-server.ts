import { initializeApp, getApps } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "firebase/firestore";

import type { VideoItem, VideoSource } from "./video-types";

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

function mapVideoDoc(id: string, data: Record<string, unknown>): VideoItem | null {
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const url = typeof data.url === "string" ? data.url.trim() : "";
  const posterUrl = typeof data.posterUrl === "string" ? data.posterUrl.trim() : "";
  const source = data.source === "youtube" || data.source === "upload" ? data.source : null;

  if (!title || !url || !posterUrl || !source) {
    return null;
  }

  const createdAt = (data.createdAt as { seconds?: number } | undefined)?.seconds
    ? new Date((data.createdAt as { seconds: number }).seconds * 1000).toISOString()
    : undefined;

  return {
    id,
    title,
    source,
    url,
    posterUrl,
    youtubeId: typeof data.youtubeId === "string" ? data.youtubeId : undefined,
    storagePath: typeof data.storagePath === "string" ? data.storagePath : undefined,
    posterStoragePath:
      typeof data.posterStoragePath === "string" ? data.posterStoragePath : undefined,
    createdAt,
  };
}

export async function getVideoItems(): Promise<VideoItem[]> {
  try {
    const snapshot = await getDocs(
      query(collection(getDb(), "videos"), orderBy("createdAt", "desc"))
    );

    return snapshot.docs
      .map((item) => mapVideoDoc(item.id, item.data() as Record<string, unknown>))
      .filter((item): item is VideoItem => Boolean(item));
  } catch (error) {
    console.error("getVideoItems:", error);
    return [];
  }
}

export type VideoRecordInput = {
  title: string;
  source: VideoSource;
  url: string;
  posterUrl: string;
  youtubeId?: string;
  storagePath?: string;
  posterStoragePath?: string;
};
