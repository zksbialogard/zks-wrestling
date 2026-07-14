export async function requestPasswordReset(email: string) {
  const response = await fetch("/api/auth/password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = (await response.json()) as { error?: string };

  if (!response.ok) {
    if (response.status === 429 || data.error === "RATE_LIMIT") {
      throw new Error("RATE_LIMIT");
    }

    if (data.error === "INVALID_EMAIL") {
      throw new Error("INVALID_EMAIL");
    }

    throw new Error("SEND_FAILED");
  }

  return { ok: true as const };
}
