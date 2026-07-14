import { getSiteUrl } from "./site-config";

function getFirebaseApiKey() {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ||
    "AIzaSyCuYZKXiIZytN49RrgGc4gWJQy8fYcUGik"
  );
}

export function isValidEmailAddress(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function sendPasswordResetEmailServer(email: string) {
  const trimmed = email.trim();

  if (!isValidEmailAddress(trimmed)) {
    throw new Error("INVALID_EMAIL");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${getFirebaseApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestType: "PASSWORD_RESET",
        email: trimmed,
        continueUrl: `${getSiteUrl()}/login`,
      }),
      cache: "no-store",
    }
  );

  const data = (await response.json()) as {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || "SEND_FAILED");
  }

  return { ok: true as const };
}
