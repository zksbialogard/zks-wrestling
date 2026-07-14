import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  deleteVideoFilesFromSupabase,
  uploadVideoFileToSupabase,
  uploadVideoPosterToSupabase,
} from "@/lib/video-supabase-storage";
import { getStaffFromRequest } from "@/lib/verify-admin";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const MAX_POSTER_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
    }

    const formData = await request.formData();
    const video = formData.get("video");
    const poster = formData.get("poster");

    if (!(video instanceof File)) {
      return NextResponse.json({ error: "Brak pliku wideo." }, { status: 400 });
    }

    if (!(poster instanceof File)) {
      return NextResponse.json({ error: "Brak miniatury wideo." }, { status: 400 });
    }

    if (!video.type.startsWith("video/")) {
      return NextResponse.json({ error: "Dozwolone są pliki wideo (MP4, WEBM)." }, { status: 400 });
    }

    if (video.size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { error: "Plik wideo jest zbyt duży (max 80 MB). Dla dłuższych filmów użyj linku YouTube." },
        { status: 400 }
      );
    }

    if (poster.size > MAX_POSTER_BYTES) {
      return NextResponse.json({ error: "Miniatura jest zbyt duża (max 5 MB)." }, { status: 400 });
    }

    const videoBuffer = Buffer.from(await video.arrayBuffer());
    const posterBuffer = Buffer.from(await poster.arrayBuffer());

    const uploadedVideo = await uploadVideoFileToSupabase(
      videoBuffer,
      video.name || "video.mp4",
      video.type || "video/mp4"
    );

    const uploadedPoster = await uploadVideoPosterToSupabase(
      posterBuffer,
      poster.name || "poster.jpg",
      poster.type || "image/jpeg"
    );

    revalidatePath("/wideo");

    return NextResponse.json({
      ok: true,
      url: uploadedVideo.url,
      storagePath: uploadedVideo.storagePath,
      posterUrl: uploadedPoster.url,
      posterStoragePath: uploadedPoster.storagePath,
    });
  } catch (error) {
    console.error("Video upload:", error);
    const message = error instanceof Error ? error.message : "Nie udało się wysłać wideo.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
    }

    const body = (await request.json()) as { storagePaths?: string[] };
    const storagePaths = Array.isArray(body.storagePaths)
      ? body.storagePaths.filter((path): path is string => typeof path === "string" && Boolean(path))
      : [];

    if (!storagePaths.length) {
      return NextResponse.json({ error: "Brak ścieżek plików." }, { status: 400 });
    }

    await deleteVideoFilesFromSupabase(storagePaths);
    revalidatePath("/wideo");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Video storage delete:", error);
    const message = error instanceof Error ? error.message : "Nie udało się usunąć plików wideo.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
