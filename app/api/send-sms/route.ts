import { NextResponse } from "next/server";

import { getAdminFromRequest } from "@/lib/verify-admin";
import { isValidPolishPhone, sendSmsMessage } from "@/lib/messaging";

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json({ error: "Brak numeru lub treści SMS." }, { status: 400 });
    }

    if (!isValidPolishPhone(phone)) {
      return NextResponse.json({ error: "Niepoprawny numer telefonu." }, { status: 400 });
    }

    const result = await sendSmsMessage({ phone, message });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Błąd wysyłania SMS." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Błąd wysyłania SMS." }, { status: 500 });
  }
}
