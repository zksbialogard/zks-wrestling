export function coercePhoneValue(value: unknown) {
  if (value == null || value === "") {
    return "";
  }

  return String(value).trim();
}

export function normalizePhone(phone: string | unknown) {
  const digits = coercePhoneValue(phone).replace(/\D/g, "");

  if (digits.length === 9) {
    return `48${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("0")) {
    return `48${digits.slice(1)}`;
  }

  if (digits.length === 11 && digits.startsWith("48")) {
    return digits;
  }

  return digits;
}

export function isValidPolishPhone(phone: string | unknown) {
  const normalized = normalizePhone(phone);
  return /^48\d{9}$/.test(normalized);
}

function getSmsApiToken() {
  return (
    process.env.SMSAPI_TOKEN?.trim() ||
    process.env.SMSAPI_KEY?.trim() ||
    process.env.SMS_API_TOKEN?.trim() ||
    ""
  );
}

export function isSmsConfigured() {
  return Boolean(getSmsApiToken());
}

export function getSmsSenderName() {
  return process.env.SMSAPI_FROM?.trim() || "";
}

function truncateSmsMessage(message: string) {
  const maxLength = 640;
  const trimmed = message.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}…`;
}

function parseSmsApiError(data: unknown) {
  if (!data || typeof data !== "object") {
    return "Błąd wysyłki SMS.";
  }

  const payload = data as {
    error?: number | string;
    message?: string;
    list?: Array<{ error?: number | string; message?: string; number?: string }>;
  };

  if (payload.list?.length) {
    const first = payload.list.find((item) => item.error);
    if (first?.message) {
      return first.message;
    }
  }

  if (payload.message) {
    return payload.message;
  }

  if (payload.error) {
    return `SMSAPI błąd ${payload.error}`;
  }

  return "Błąd wysyłki SMS.";
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getEmailFromAddress() {
  return process.env.EMAIL_FROM?.trim() || "ZKS Białogard <onboarding@resend.dev>";
}

export function isResendSandboxMode() {
  return getEmailFromAddress().includes("onboarding@resend.dev");
}

export function getResendSandboxTestEmail() {
  return process.env.RESEND_SANDBOX_TO?.trim() || "zksbialogard@wp.pl";
}

export async function sendEmailMessage(input: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  wrapHtml?: boolean;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();

  if (!resendKey) {
    console.warn("RESEND_API_KEY brak — email nie wysłany:", input.to, input.subject);
    return {
      ok: false as const,
      simulated: true,
      error: "Brak RESEND_API_KEY na Vercel.",
    };
  }

  const { wrapEmailHtml } = await import("./email-layout");
  const html =
    input.html && input.wrapHtml !== false
      ? wrapEmailHtml(input.html, input.text?.slice(0, 120))
      : input.html;

  try {
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
        html,
        text: input.text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false as const,
        simulated: false,
        error: data?.message || "Błąd wysyłki email.",
      };
    }

    return { ok: true as const, simulated: false, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd połączenia z Resend.";
    return { ok: false as const, simulated: false, error: message };
  }
}

export async function sendSmsMessage(input: { phone: string | unknown; message: string }) {
  const token = getSmsApiToken();

  if (!token) {
    console.warn("SMSAPI_TOKEN brak — SMS pominięty:", input.phone);
    return { ok: false as const, skipped: true };
  }

  const rawPhone = coercePhoneValue(input.phone);
  const to = normalizePhone(rawPhone);

  if (!isValidPolishPhone(rawPhone)) {
    return {
      ok: false as const,
      skipped: false,
      error: `Niepoprawny numer telefonu: ${rawPhone || "(pusty)"}`,
    };
  }

  const message = truncateSmsMessage(input.message);
  const params = new URLSearchParams({
    to,
    message,
    format: "json",
  });

  const sender = getSmsSenderName();
  if (sender) {
    params.set("from", sender);
  }

  try {
    const response = await fetch("https://api.smsapi.pl/sms.do", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = (await response.json()) as {
      error?: number | string;
      message?: string;
      count?: number;
      list?: Array<{ error?: number | string; message?: string }>;
    };

    const listError = data.list?.find((item) => item.error);
    if (data.error || listError?.error) {
      return {
        ok: false as const,
        skipped: false,
        error: parseSmsApiError(data),
      };
    }

    if (!response.ok) {
      return {
        ok: false as const,
        skipped: false,
        error: parseSmsApiError(data),
      };
    }

    return { ok: true as const, skipped: false, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd połączenia z SMSAPI.";
    return { ok: false as const, skipped: false, error: message };
  }
}
