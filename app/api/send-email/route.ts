import { NextResponse } from "next/server";

import { sendEmailMessage } from "@/lib/messaging";

export async function POST(request: Request) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject) {
      return NextResponse.json(
        { error: "Brak adresu lub tematu wiadomości." },
        { status: 400 }
      );
    }

    const result = await sendEmailMessage({
      to,
      subject,
      html,
      text,
      wrapHtml: false,
    });

    if (!result.ok) {
      if (result.simulated) {
        return NextResponse.json({
          ok: true,
          simulated: true,
          message: "Email zapisany lokalnie (brak RESEND_API_KEY).",
        });
      }

      return NextResponse.json(
        { error: result.error || "Błąd wysyłki email." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd wysyłania email." }, { status: 500 });
  }
}
