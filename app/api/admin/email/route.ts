import { NextResponse } from "next/server";

import { getEmailFromAddress, isEmailConfigured } from "@/lib/messaging";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isEmailConfigured(),
    from: getEmailFromAddress(),
    hint: isEmailConfigured()
      ? "E-mail gotowy. Użyj „Wyślij test” w Szablony."
      : "Dodaj RESEND_API_KEY i EMAIL_FROM na Vercel, potem Redeploy.",
  });
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const to = body.to || admin.email;

    if (!to) {
      return NextResponse.json(
        { error: "Brak adresu e-mail administratora." },
        { status: 400 }
      );
    }

    const { sendEmailMessage } = await import("@/lib/messaging");

    const result = await sendEmailMessage({
      to,
      subject: "ZKS Białogard — test e-mail z aplikacji",
      html: `<p>To jest testowa wiadomość z <strong>ZKS Manager</strong>.</p><p>Jeśli ją widzisz, Resend działa poprawnie.</p>`,
      text: "To jest testowa wiadomość z ZKS Manager. Jeśli ją widzisz, Resend działa poprawnie.",
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Nie udało się wysłać testowego e-maila." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      simulated: result.simulated,
      to,
      message: result.simulated
        ? "Brak RESEND_API_KEY — email nie wysłany."
        : "Testowy e-mail wysłany.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd wysyłki testowego e-maila." }, { status: 500 });
  }
}
