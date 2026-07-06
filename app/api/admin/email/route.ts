import { NextResponse } from "next/server";

import {
  getEmailFromAddress,
  getResendSandboxTestEmail,
  isEmailConfigured,
  isResendSandboxMode,
} from "@/lib/messaging";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function GET() {
  const sandbox = isResendSandboxMode();
  const sandboxTestTo = getResendSandboxTestEmail();

  return NextResponse.json({
    ok: true,
    configured: isEmailConfigured(),
    from: getEmailFromAddress(),
    sandbox,
    sandboxTestTo,
    hint: !isEmailConfigured()
      ? "Dodaj RESEND_API_KEY i EMAIL_FROM na Vercel, potem Redeploy."
      : sandbox
        ? `Tryb testowy — wysyłka tylko na ${sandboxTestTo}.`
        : "E-mail gotowy do wysyłki do rodziców.",
  });
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const sandbox = isResendSandboxMode();
    const sandboxTestTo = getResendSandboxTestEmail();
    const requestedTo = typeof body.to === "string" ? body.to.trim() : "";
    const to = sandbox ? sandboxTestTo : requestedTo || admin.email;

    if (!to) {
      return NextResponse.json(
        { error: "Brak adresu e-mail do wysyłki testu." },
        { status: 400 }
      );
    }

    const { sendEmailMessage } = await import("@/lib/messaging");

    const result = await sendEmailMessage({
      to,
      subject: "ZKS Białogard — test e-mail z aplikacji",
      html: `<p>To jest testowa wiadomość z <strong>ZKS Manager</strong>.</p><p>Jeśli ją widzisz, wysyłka e-mail działa poprawnie.</p>`,
      text: "To jest testowa wiadomość z ZKS Manager. Jeśli ją widzisz, wysyłka e-mail działa poprawnie.",
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
        ? "Brak RESEND_API_KEY — e-mail nie wysłany."
        : `Test wysłany na ${to}. Sprawdź skrzynkę i folder SPAM.`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd wysyłki testowego e-maila." }, { status: 500 });
  }
}
