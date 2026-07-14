export type VideoSource = "youtube" | "upload";

export type VideoItem = {
  id: string;
  title: string;
  source: VideoSource;
  youtubeId?: string;
  url: string;
  posterUrl: string;
  storagePath?: string;
  posterStoragePath?: string;
  createdAt?: string;
};
