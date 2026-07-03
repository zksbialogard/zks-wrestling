import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    const token = process.env.SMSAPI_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Brak SMSAPI_TOKEN" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.smsapi.pl/sms.do",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          to: phone,
          message,
          format: "json",
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Błąd wysyłania SMS" },
      { status: 500 }
    );
  }
}