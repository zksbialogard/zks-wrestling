import { createSupabaseAdmin } from "./supabase";

const VIDEO_BUCKET = "videos";

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function safeFileName(fileName: string) {
  return fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "") || "video.mp4";
}

export async function uploadVideoFileToSupabase(
  file: Buffer,
  fileName: string,
  contentType: string
) {
  if (!hasServiceRole()) {
    throw new Error("Brak SUPABASE_SERVICE_ROLE_KEY — nie można zapisać wideo.");
  }

  const supabase = createSupabaseAdmin();
  const storagePath = `uploads/${Date.now()}-${safeFileName(fileName)}`;

  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(storagePath, file, {
    contentType: contentType || "video/mp4",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    if (/bucket/i.test(error.message)) {
      throw new Error(
        "Brak bucketu „videos” w Supabase. Uruchom migrację 015_videos_storage.sql."
      );
    }

    throw new Error(error.message || "Nie udało się zapisać wideo.");
  }

  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(storagePath);

  return {
    url: data.publicUrl,
    storagePath,
  };
}

export async function uploadVideoPosterToSupabase(
  file: Buffer,
  fileName: string,
  contentType: string
) {
  if (!hasServiceRole()) {
    throw new Error("Brak SUPABASE_SERVICE_ROLE_KEY — nie można zapisać miniatury.");
  }

  const supabase = createSupabaseAdmin();
  const storagePath = `posters/${Date.now()}-${safeFileName(fileName)}`;

  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(storagePath, file, {
    contentType: contentType || "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "Nie udało się zapisać miniatury wideo.");
  }

  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(storagePath);

  return {
    url: data.publicUrl,
    storagePath,
  };
}

export async function deleteVideoFilesFromSupabase(paths: string[]) {
  if (!hasServiceRole() || !paths.length) {
    return;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage.from(VIDEO_BUCKET).remove(paths);

  if (error) {
    console.error("deleteVideoFilesFromSupabase:", error);
  }
}
