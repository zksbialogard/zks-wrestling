import { NextResponse } from "next/server";

import {
  getSmsSenderName,
  isSmsConfigured,
  isValidPolishPhone,
  sendSmsMessage,
} from "@/lib/messaging";
import { loadParentUsers } from "@/lib/notify-service";
import { getAdminFromRequest, getUserFromRequest } from "@/lib/verify-admin";

export async function GET() {
  const parents = await loadParentUsers();
  const withPhone = parents.filter((parent) => parent.telefon?.trim()).length;

  return NextResponse.json({
    ok: true,
    configured: isSmsConfigured(),
    sender: getSmsSenderName() || "(domyślny SMSAPI)",
    totalParents: parents.length,
    parentsWithPhone: withPhone,
    hint: !isSmsConfigured()
      ? "Dodaj SMSAPI_TOKEN i SMSAPI_FROM na Vercel, potem Redeploy."
      : withPhone > 0
        ? `Gotowe — ${withPhone} z ${parents.length} rodziców ma numer telefonu.`
        : "Brak numerów telefonów u rodziców. Uzupełnij je przy rejestracji lub w profilu.",
  });
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    if (!isSmsConfigured()) {
      return NextResponse.json(
        { error: "Brak SMSAPI_TOKEN na Vercel." },
        { status: 400 }
      );
    }

    const body = await request.json();
    let phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!phone) {
      const session = await getUserFromRequest(request);
      phone = (session?.profile.telefon as string | undefined)?.trim() || "";
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Podaj numer telefonu do testu (9 cyfr)." },
        { status: 400 }
      );
    }

    if (!isValidPolishPhone(phone)) {
      return NextResponse.json(
        { error: "Niepoprawny numer — wpisz 9 cyfr, np. 790335967." },
        { status: 400 }
      );
    }

    const result = await sendSmsMessage({
      phone,
      message: "ZKS Białogard: test SMS — polskie znaki działają: ąęółśźż.",
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Nie udało się wysłać testowego SMS." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      phone,
      message: `Testowy SMS wysłany na ${phone}.`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd wysyłki testowego SMS." }, { status: 500 });
  }
}
