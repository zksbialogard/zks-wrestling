import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  createFirebaseNews,
  deleteFirebaseNews,
  updateFirebaseNews,
} from "@/lib/news-firebase";
import { seedDefaultTemplatesIfEmpty } from "@/lib/notifications-db";
import { notifyClubMembers } from "@/lib/notify-service";
import { createSupabaseAdmin } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/verify-admin";

function hasSupabaseAdminKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, notify } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Tytuł i treść są wymagane." },
        { status: 400 }
      );
    }

    if (hasSupabaseAdminKey()) {
      const supabase = createSupabaseAdmin();
      const { data, error } = await supabase
        .from("aktualnosci")
        .insert([{ title, content }])
        .select("*")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      revalidatePath("/aktualnosci");
      revalidatePath("/");

      let notifyResult = null;

      if (notify) {
        try {
          await seedDefaultTemplatesIfEmpty();
          const preview =
            content.length > 120 ? `${content.slice(0, 117).trim()}…` : content;
          notifyResult = await notifyClubMembers({
            templateKey: "news_published",
            variables: { title, content: preview },
            channels: {
              email: false,
              sms: false,
              inApp: true,
              push: true,
            },
            type: "news",
            link: "/aktualnosci",
          });
        } catch (notifyError) {
          console.error("Notify after news create:", notifyError);
        }
      }

      return NextResponse.json({ ok: true, data, source: "supabase", notifyResult });
    }

    await createFirebaseNews({ title, content });
    revalidatePath("/aktualnosci");
    revalidatePath("/");

    let notifyResult = null;

    if (notify) {
      try {
        await seedDefaultTemplatesIfEmpty();
        const preview =
          content.length > 120 ? `${content.slice(0, 117).trim()}…` : content;
        notifyResult = await notifyClubMembers({
          templateKey: "news_published",
          variables: { title, content: preview },
          channels: {
            email: false,
            sms: false,
            inApp: true,
            push: true,
          },
          type: "news",
          link: "/aktualnosci",
        });
      } catch (notifyError) {
        console.error("Notify after news create:", notifyError);
      }
    }

    return NextResponse.json({
      ok: true,
      source: "firebase",
      message: "Zapisano w Firebase (brak SUPABASE_SERVICE_ROLE_KEY).",
      notifyResult,
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się dodać aktualności.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
