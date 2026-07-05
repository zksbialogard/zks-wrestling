export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 9) {
    return `48${digits}`;
  }

  return digits;
}

export async function sendEmailMessage(input: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM || "ZKS Białogard <onboarding@resend.dev>";

  if (!resendKey) {
    console.warn("RESEND_API_KEY brak — email symulowany:", input.to, input.subject);
    return { ok: true as const, simulated: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Błąd wysyłki email.");
  }

  return { ok: true as const, simulated: false, data };
}

export async function sendSmsMessage(input: { phone: string; message: string }) {
  const token = process.env.SMSAPI_TOKEN;

  if (!token) {
    console.warn("SMSAPI_TOKEN brak — SMS pominięty:", input.phone);
    return { ok: false as const, skipped: true };
  }

  const response = await fetch("https://api.smsapi.pl/sms.do", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      to: normalizePhone(input.phone),
      message: input.message,
      format: "json",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Błąd wysyłki SMS.");
  }

  return { ok: true as const, skipped: false, data };
}
