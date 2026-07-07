import { clubContact } from "@/components/contact/contact-content";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getClubContactEmail() {
  return process.env.CLUB_CONTACT_EMAIL?.trim() || clubContact.email;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type ContactEmailInput = {
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  website?: string;
};

export function validateContactEmailInput(input: ContactEmailInput) {
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone?.trim() || "";
  const topic = input.topic.trim();
  const message = input.message.trim();

  if (input.website?.trim()) {
    return { ok: false as const, honeypot: true };
  }

  if (!name || name.length > 120) {
    return { ok: false as const, error: "Podaj poprawne imię i nazwisko." };
  }

  if (!email || !EMAIL_PATTERN.test(email) || email.length > 160) {
    return { ok: false as const, error: "Podaj poprawny adres e-mail." };
  }

  if (phone.length > 40) {
    return { ok: false as const, error: "Numer telefonu jest zbyt długi." };
  }

  if (!topic || topic.length > 80) {
    return { ok: false as const, error: "Wybierz temat wiadomości." };
  }

  if (!message || message.length < 10 || message.length > 4000) {
    return {
      ok: false as const,
      error: "Wiadomość musi mieć od 10 do 4000 znaków.",
    };
  }

  return {
    ok: true as const,
    data: { name, email, phone, topic, message },
  };
}

export function buildContactEmailContent(input: {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
}) {
  const subject = `[Kontakt ZKS] ${input.topic} — ${input.name}`;
  const text = [
    `Imię i nazwisko: ${input.name}`,
    `E-mail: ${input.email}`,
    input.phone ? `Telefon: ${input.phone}` : null,
    `Temat: ${input.topic}`,
    "",
    input.message,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <p><strong>Imię i nazwisko:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(input.email)}</p>
      ${input.phone ? `<p><strong>Telefon:</strong> ${escapeHtml(input.phone)}</p>` : ""}
      <p><strong>Temat:</strong> ${escapeHtml(input.topic)}</p>
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
    </div>
  `.trim();

  return { subject, text, html };
}
