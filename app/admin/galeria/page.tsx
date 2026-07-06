"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AuthField from "@/components/auth/AuthField";
import { deleteGalleryPhoto, registerGalleryPhoto } from "@/lib/gallery-admin";
import { compressImageForUpload } from "@/lib/gallery-image-utils";
import type { GalleryItem } from "@/lib/gallery-types";
import { hasNotifyIssues, sanitizeNotifyResult } from "@/lib/notify-result-utils";
import type { NotifyResult } from "@/lib/notify-service";
import { db, storage } from "@/lib/firebase";

export default function AdminGaleriaPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [notifyMembers, setNotifyMembers] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadGallery = async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(
        query(collection(db, "gallery"), orderBy("createdAt", "desc"))
      );

      setItems(
        snapshot.docs.map((item) => {
          const data = item.data();
          const createdAt = data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000).toISOString()
            : undefined;

          return {
            id: item.id,
            title: (data.title as string) || "",
            url: (data.url as string) || "",
            storagePath: data.storagePath as string | undefined,
            createdAt,
          };
        })
      );
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się wczytać galerii.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const uploadPhoto = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      toast.error("Wybierz zdjęcie.");
      return;
    }

    setUploading(true);

    try {
      const compressed = await compressImageForUpload(file);
      const safeName = compressed.name.replace(/\s+/g, "-");
      const storagePath = `gallery/${Date.now()}-${safeName}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, compressed);
      const url = await getDownloadURL(storageRef);

      const result = await registerGalleryPhoto({
        title: title || safeName,
        url,
        storagePath,
        notify: notifyMembers,
      });

      if (result.notifyResult) {
        const clean = sanitizeNotifyResult(result.notifyResult as NotifyResult);

        if (hasNotifyIssues(clean)) {
          toast.warning(
            `Zdjęcie dodane. Powiadomienia: ${clean.inAppSent} w aplikacji, ${clean.pushSent} push.`
          );
        } else if (notifyMembers) {
          toast.success(
            `Zdjęcie dodane. Powiadomiono ${clean.inAppSent} członków klubu.`
          );
        } else {
          toast.success("Zdjęcie dodane do galerii.");
        }
      } else {
        toast.success(
          notifyMembers
            ? "Zdjęcie dodane do galerii."
            : "Zdjęcie dodane do galerii (bez powiadomień)."
        );
      }

      setTitle("");
      setFile(null);
      setNotifyMembers(true);
      await loadGallery();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Nie udało się dodać zdjęcia."
      );
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (item: GalleryItem) => {
    if (!confirm("Usunąć to zdjęcie?")) return;

    try {
      if (item.storagePath) {
        await deleteObject(ref(storage, item.storagePath));
      }

      await deleteGalleryPhoto(item.id);
      toast.success("Zdjęcie usunięte.");
      await loadGallery();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się usunąć zdjęcia.");
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Galeria"
        description="Dodawaj i usuwaj zdjęcia klubowe widoczne w aplikacji."
      />

      <form onSubmit={uploadPhoto} className="zks-card mb-8 space-y-4 p-6">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
          Dodaj zdjęcie
        </h2>

        <AuthField
          label="Tytuł (opcjonalnie)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Np. Turniej w Koszalinie"
        />

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Plik
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-zks-text file:mr-4 file:rounded-md file:border-0 file:bg-zks-gold file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-zks-black"
          />
        </label>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-zks-text">
          <input
            type="checkbox"
            checked={notifyMembers}
            onChange={(e) => setNotifyMembers(e.target.checked)}
            className="h-4 w-4 rounded border-zks-gold-mid/40 accent-zks-gold"
          />
          Powiadom rodziców i zawodników
        </label>

        <button
          type="submit"
          disabled={uploading}
          className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {uploading ? "Wysyłanie..." : "Dodaj do galerii"}
        </button>
      </form>

      {loading ? (
        <p className="text-zks-text-muted">Ładowanie galerii...</p>
      ) : items.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">Brak zdjęć w galerii.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="zks-card overflow-hidden">
              <div className="relative aspect-[4/3] bg-zks-black">
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-white">{item.title}</h3>

                <button
                  type="button"
                  onClick={() => removePhoto(item)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
