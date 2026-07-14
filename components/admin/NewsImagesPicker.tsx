"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { prepareGalleryImages } from "@/lib/gallery-image-utils";
import { uploadGalleryFileViaApi, deleteGalleryFileViaApi } from "@/lib/gallery-storage-upload";
import type { NewsImage } from "@/lib/news-images";

type Props = {
  value: NewsImage[];
  onChange: (images: NewsImage[]) => void;
  disabled?: boolean;
  /** Przy nowej aktualności od razu kasuj plik z storage po usunięciu z listy. */
  cleanupStorageOnRemove?: boolean;
};

export default function NewsImagesPicker({
  value,
  onChange,
  disabled = false,
  cleanupStorageOnRemove = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList?.length || disabled) {
      return;
    }

    const files = Array.from(fileList);
    let nextImages = [...value];

    for (const file of files) {
      setUploadingCount((count) => count + 1);

      try {
        const prepared = await prepareGalleryImages(file);
        const uploaded = await uploadGalleryFileViaApi(prepared.full, "gallery/news");

        nextImages = [
          ...nextImages,
          {
            url: uploaded.url,
            storagePath: uploaded.storagePath,
          },
        ];
        onChange(nextImages);
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error
            ? `${file.name}: ${error.message}`
            : `Nie udało się wysłać ${file.name}.`
        );
      } finally {
        setUploadingCount((count) => Math.max(0, count - 1));
      }
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = async (index: number) => {
    const image = value[index];
    if (!image) {
      return;
    }

    onChange(value.filter((_, itemIndex) => itemIndex !== index));

    if (
      cleanupStorageOnRemove &&
      image.storagePath?.startsWith("gallery/")
    ) {
      try {
        await deleteGalleryFileViaApi(image.storagePath);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
          Zdjęcia (opcjonalnie)
        </span>
        <span className="text-xs text-zks-text-muted">
          {value.length} {value.length === 1 ? "zdjęcie" : "zdjęć"}
        </span>
      </div>

      {value.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((image, index) => (
            <li
              key={`${image.storagePath || image.url}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-zks-gold-mid/20 bg-zks-black/40"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={image.url}
                  alt={`Zdjęcie ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled || uploadingCount > 0}
                className="absolute right-2 top-2 rounded-lg border border-red-500/40 bg-zks-black/80 p-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                aria-label={`Usuń zdjęcie ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zks-gold-mid/30 bg-zks-black/30 px-4 py-6 text-center transition hover:border-zks-gold-mid/50 hover:bg-zks-black/50 ${
          disabled || uploadingCount > 0 ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          multiple
          disabled={disabled || uploadingCount > 0}
          onChange={(event) => void handleFilesSelected(event.target.files)}
          className="sr-only"
        />
        {uploadingCount > 0 ? (
          <Loader2 className="h-6 w-6 animate-spin text-zks-gold-bright" />
        ) : (
          <ImagePlus className="h-6 w-6 text-zks-gold-bright" />
        )}
        <span className="text-sm font-medium text-white">
          {uploadingCount > 0
            ? `Wysyłanie zdjęć (${uploadingCount})...`
            : "Dodaj zdjęcia"}
        </span>
        <span className="text-xs text-zks-text-muted">
          Możesz wybrać kilka plików naraz. JPG, PNG lub WEBP — max 25 MB na plik.
        </span>
      </label>
    </div>
  );
}
