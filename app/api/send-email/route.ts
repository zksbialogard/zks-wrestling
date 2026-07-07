import { NextResponse } from "next/server";

import {
  buildContactEmailContent,
  getClubContactEmail,
  validateContactEmailInput,
  type ContactEmailInput,
} from "@/lib/contact-email";
import { sendEmailMessage } from "@/lib/messaging";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (!checkRateLimit(`contact-email:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Zbyt wiele wiadomości z tego adresu. Spróbuj ponownie później." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as ContactEmailInput;
    const validation = validateContactEmailInput(body);

    if (!validation.ok) {
      if ("honeypot" in validation && validation.honeypot) {
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const content = buildContactEmailContent(validation.data);
    const result = await sendEmailMessage({
      to: getClubContactEmail(),
      subject: content.subject,
      html: content.html,
      text: content.text,
      replyTo: validation.data.email,
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
