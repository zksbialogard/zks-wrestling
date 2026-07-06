import { createSupabaseAdmin } from "./supabase";

const BUCKET = "gallery";

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function uploadGalleryImageToSupabase(
  file: Buffer,
  fileName: string,
  contentType: string
) {
  if (!hasServiceRole()) {
    throw new Error(
      "Brak SUPABASE_SERVICE_ROLE_KEY na Vercel — nie można zapisać zdjęcia."
    );
  }

  const supabase = createSupabaseAdmin();
  const safeName = fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  const storagePath = `gallery/${Date.now()}-${safeName || "photo.jpg"}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    contentType: contentType || "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    if (/bucket/i.test(error.message)) {
      throw new Error(
        "Brak bucketu „gallery” w Supabase. Uruchom migrację 009_gallery_storage.sql w SQL Editor."
      );
    }

    throw new Error(error.message || "Nie udało się zapisać zdjęcia w Supabase Storage.");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return {
    url: data.publicUrl,
    storagePath,
  };
}

export async function deleteGalleryImageFromSupabase(storagePath: string) {
  if (!hasServiceRole() || !storagePath) {
    return;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);

  if (error) {
    console.error("deleteGalleryImageFromSupabase:", error);
  }
}
