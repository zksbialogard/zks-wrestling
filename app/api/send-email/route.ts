import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject) {
      return NextResponse.json(
        { error: "Brak adresu lub tematu wiadomości." },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    const from =
      process.env.EMAIL_FROM || "ZKS Białogard <onboarding@resend.dev>";

    if (!resendKey) {
      console.warn("RESEND_API_KEY brak — email nie został wysłany:", to, subject);
      return NextResponse.json({
        ok: true,
        simulated: true,
        message: "Email zapisany lokalnie (brak RESEND_API_KEY).",
      });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Błąd wysyłki email." },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd wysyłania email." }, { status: 500 });
  }
}
