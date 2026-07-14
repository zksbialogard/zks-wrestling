import { NextResponse } from "next/server";

import { sendPasswordResetEmailServer, isValidEmailAddress } from "@/lib/password-reset";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (!checkRateLimit(`password-reset:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });
    }

    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim() || "";

    if (!isValidEmailAddress(email)) {
      return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
    }

    try {
      await sendPasswordResetEmailServer(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : "SEND_FAILED";

      if (message.includes("EMAIL_NOT_FOUND")) {
        return NextResponse.json({ ok: true });
      }

      if (message === "INVALID_EMAIL") {
        return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
      }

      console.error("password-reset:", error);
      return NextResponse.json({ error: "SEND_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "SEND_FAILED" }, { status: 500 });
  }
}
