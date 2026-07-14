"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { toast } from "sonner";
import { Film, Link2, Loader2, Trash2, Upload } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AuthField from "@/components/auth/AuthField";
import {
  deleteVideoFromFirestore,
  ensureVideoUploadAuth,
  saveVideoToFirestore,
} from "@/lib/video-admin";
import { db } from "@/lib/firebase";
import type { VideoItem, VideoSource } from "@/lib/video-types";
import { captureVideoPoster } from "@/lib/video-poster-utils";
import { deleteVideoFilesViaApi, uploadVideoFileViaApi } from "@/lib/video-storage-upload";
import { parseYoutubeVideoId, youtubePosterUrl } from "@/lib/video-utils";

type UploadPhase = "idle" | "poster" | "uploading" | "saving";

export default function AdminWideoPage() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<VideoSource>("youtube");
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");

  const loadVideos = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const snapshot = await getDocs(
        query(collection(db, "videos"), orderBy("createdAt", "desc"))
      );

      setItems(
        snapshot.docs
          .map((item) => {
            const data = item.data();
            const createdAt = data.createdAt?.seconds
              ? new Date(data.createdAt.seconds * 1000).toISOString()
              : undefined;

            return {
              id: item.id,
              title: (data.title as string) || "",
              source: data.source as VideoSource,
              url: (data.url as string) || "",
              posterUrl: (data.posterUrl as string) || "",
              youtubeId: data.youtubeId as string | undefined,
              storagePath: data.storagePath as string | undefined,
              posterStoragePath: data.posterStoragePath as string | undefined,
              createdAt,
            } satisfies VideoItem;
          })
          .filter((item) => item.title && item.url && item.posterUrl)
      );
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się wczytać listy wideo.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const resetForm = () => {
    setTitle("");
    setYoutubeUrl("");
    setVideoFile(null);
    setSource("youtube");
    setUploadPhase("idle");
  };

  const addYoutubeVideo = async () => {
    const youtubeId = parseYoutubeVideoId(youtubeUrl);

    if (!title.trim() || !youtubeId) {
      toast.error("Podaj tytuł i poprawny link YouTube.");
      return;
    }

    setUploading(true);
    setUploadPhase("saving");

    try {
      await ensureVideoUploadAuth();

      const id = await saveVideoToFirestore({
        title: title.trim(),
        source: "youtube",
        youtubeId,
        url: `https://www.youtube.com/watch?v=${youtubeId}`,
        posterUrl: youtubePosterUrl(youtubeId),
      });

      const newItem: VideoItem = {
        id,
        title: title.trim(),
        source: "youtube",
        youtubeId,
        url: `https://www.youtube.com/watch?v=${youtubeId}`,
        posterUrl: youtubePosterUrl(youtubeId),
        createdAt: new Date().toISOString(),
      };

      setItems((current) => [newItem, ...current]);
      toast.success("Film z YouTube dodany.");
      resetForm();
      void loadVideos(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Nie udało się dodać filmu.");
    } finally {
      setUploading(false);
      setUploadPhase("idle");
    }
  };

  const uploadVideo = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!videoFile || !title.trim()) {
      toast.error("Podaj tytuł i wybierz plik wideo.");
      return;
    }

    if (videoFile.size > 80 * 1024 * 1024) {
      toast.error("Plik jest zbyt duży (max 80 MB). Użyj YouTube dla dłuższych nagrań.");
      return;
    }

    setUploading(true);
    setUploadPhase("poster");

    try {
      await ensureVideoUploadAuth();
      const poster = await captureVideoPoster(videoFile);

      setUploadPhase("uploading");
      const uploaded = await uploadVideoFileViaApi(videoFile, poster);

      setUploadPhase("saving");
      const id = await saveVideoToFirestore({
        title: title.trim(),
        source: "upload",
        url: uploaded.url,
        posterUrl: uploaded.posterUrl,
        storagePath: uploaded.storagePath,
        posterStoragePath: uploaded.posterStoragePath,
      });

      const newItem: VideoItem = {
        id,
        title: title.trim(),
        source: "upload",
        url: uploaded.url,
        posterUrl: uploaded.posterUrl,
        storagePath: uploaded.storagePath,
        posterStoragePath: uploaded.posterStoragePath,
        createdAt: new Date().toISOString(),
      };

      setItems((current) => [newItem, ...current]);
      toast.success("Wideo opublikowane.");
      resetForm();
      void loadVideos(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Nie udało się dodać wideo.");
    } finally {
      setUploading(false);
      setUploadPhase("idle");
    }
  };

  const removeVideo = async (item: VideoItem) => {
    if (!confirm(`Usunąć film „${item.title}”?`)) {
      return;
    }

    try {
      if (item.source === "upload") {
        const paths = [item.storagePath, item.posterStoragePath].filter(
          (path): path is string => Boolean(path)
        );

        if (paths.length) {
          try {
            await deleteVideoFilesViaApi(paths);
          } catch (storageError) {
            console.error(storageError);
          }
        }
      }

      await deleteVideoFromFirestore(item.id);
      setItems((current) => current.filter((video) => video.id !== item.id));
      toast.success("Film usunięty.");
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się usunąć filmu.");
    }
  };

  const phaseLabel =
    uploadPhase === "poster"
      ? "Miniatura..."
      : uploadPhase === "uploading"
        ? "Wysyłanie..."
        : uploadPhase === "saving"
          ? "Zapisywanie..."
          : "Opublikuj wideo";

  return (
    <>
      <AdminPageHeader
        title="Wideo"
        description="Dodawaj filmy z YouTube lub krótkie nagrania (max 80 MB). Na stronie ładuje się tylko miniatura — pełne wideo startuje po kliknięciu."
      />

      <div className="zks-card mb-8 space-y-5 p-6">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
          Nowe wideo
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSource("youtube")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              source === "youtube" ? "zks-btn-primary" : "zks-btn-outline"
            }`}
          >
            <Link2 className="h-4 w-4" />
            Link YouTube
          </button>
          <button
            type="button"
            onClick={() => setSource("upload")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              source === "upload" ? "zks-btn-primary" : "zks-btn-outline"
            }`}
          >
            <Upload className="h-4 w-4" />
            Plik wideo
          </button>
        </div>

        <AuthField
          label="Tytuł"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Np. Finał Mistrzostw Polski U15"
        />

        {source === "youtube" ? (
          <>
            <AuthField
              label="Link YouTube"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-zks-text-muted">
              YouTube ładuje się najszybciej — na liście widać tylko miniaturę, a odtwarzacz
              startuje po kliknięciu.
            </p>
            <button
              type="button"
              onClick={() => void addYoutubeVideo()}
              disabled={uploading}
              className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
              Dodaj z YouTube
            </button>
          </>
        ) : (
          <form onSubmit={uploadVideo} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
                Plik wideo
              </span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-zks-text file:mr-4 file:rounded-md file:border-0 file:bg-zks-gold file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-zks-black"
              />
            </label>
            <p className="text-xs text-zks-text-muted">
              MP4 lub WEBM, max 80 MB. Miniatura generuje się automatycznie — dzięki temu strona
              nie pobiera całego filmu od razu.
            </p>
            <button
              type="submit"
              disabled={uploading}
              className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {phaseLabel}
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie...</p>
      ) : items.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">Brak opublikowanych filmów.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="zks-card overflow-hidden">
              <div className="relative aspect-video bg-zks-black">
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-zks-text-muted">
                  {item.source === "youtube" ? "YouTube" : "Plik wideo"}
                </p>
                <button
                  type="button"
                  onClick={() => void removeVideo(item)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Usuń
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
