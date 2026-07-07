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
  const maxLength = 402;
  const trimmed = message.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export function smsUsesUnicode(message: string) {
  return /[^\u0000-\u007F]/.test(message);
}

export function estimateSmsParts(message: string) {
  const length = message.trim().length;
  const partSize = smsUsesUnicode(message) ? 70 : 160;
  return Math.max(1, Math.ceil(length / partSize));
}

export const SMS_ACCOUNT_LIMITED_MESSAGE =
  "Konto SMSAPI jest w trybie testowym — SMS można wysłać tylko na numer podany przy rejestracji. Aby wysyłać do wszystkich rodziców: doładuj konto, przejdź weryfikację firmy w panelu smsapi.pl lub skontaktuj się z obsługą SMSAPI.";

export function isSmsAccountLimitedError(message: string) {
  return (
    /account is limited/i.test(message) ||
    /registration form/i.test(message) ||
    message.includes(SMS_ACCOUNT_LIMITED_MESSAGE)
  );
}

function humanizeSmsError(message: string, sender: string) {
  if (isSmsAccountLimitedError(message)) {
    return SMS_ACCOUNT_LIMITED_MESSAGE;
  }

  if (/invalid from/i.test(message)) {
    return sender
      ? `Pole nadawcy „${sender}” nie jest zatwierdzone w SMSAPI. Dodaj je w panelu smsapi.pl → Pola nadawcy, albo ustaw krótszą nazwę (np. ZKS) w SMSAPI_FROM na Vercel.`
      : "Niepoprawne pole nadawcy w SMSAPI. Sprawdź SMSAPI_FROM na Vercel.";
  }

  return message;
}

function parseSmsApiError(data: unknown, sender = "") {
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
      return humanizeSmsError(first.message, sender);
    }
  }

  if (payload.message) {
    return humanizeSmsError(payload.message, sender);
  }

  if (payload.error) {
    return `SMSAPI błąd ${payload.error}`;
  }

  return "Błąd wysyłki SMS.";
}

function smsApiHasError(data: {
  error?: number | string;
  list?: Array<{ error?: number | string; message?: string }>;
}) {
  return Boolean(data.error || data.list?.some((item) => item.error));
}

function isInvalidFromError(data: {
  message?: string;
  list?: Array<{ message?: string }>;
}) {
  const messages = [
    data.message,
    ...(data.list?.map((item) => item.message) || []),
  ].filter(Boolean);

  return messages.some((item) => /invalid from/i.test(item || ""));
}

async function requestSmsApi(token: string, params: URLSearchParams) {
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

  return { response, data };
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
  replyTo?: string;
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
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
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
    encoding: "utf-8",
  });

  const sender = getSmsSenderName();
  if (sender) {
    params.set("from", sender);
  }

  try {
    let { response, data } = await requestSmsApi(token, params);

    if (sender && smsApiHasError(data) && isInvalidFromError(data)) {
      const fallbackParams = new URLSearchParams(params);
      fallbackParams.delete("from");
      ({ response, data } = await requestSmsApi(token, fallbackParams));
    }

    if (smsApiHasError(data)) {
      return {
        ok: false as const,
        skipped: false,
        error: parseSmsApiError(data, sender),
      };
    }

    if (!response.ok) {
      return {
        ok: false as const,
        skipped: false,
        error: parseSmsApiError(data, sender),
      };
    }

    return { ok: true as const, skipped: false, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd połączenia z SMSAPI.";
    return { ok: false as const, skipped: false, error: message };
  }
}
