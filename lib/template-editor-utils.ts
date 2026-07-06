import type { TemplateKey } from "./message-templates";

export const TEMPLATE_VARIABLES = [
  { key: "title", label: "Tytuł" },
  { key: "location", label: "Miejsce" },
  { key: "eventDate", label: "Data zawodów" },
  { key: "registrationDeadline", label: "Termin zapisów" },
  { key: "childName", label: "Imię zawodnika" },
  { key: "message", label: "Treść wiadomości" },
  { key: "content", label: "Treść aktualności" },
  { key: "link", label: "Link do aplikacji" },
  { key: "groupName", label: "Grupa treningowa" },
  { key: "sessionDate", label: "Data treningu" },
  { key: "sessionTime", label: "Godziny treningu" },
] as const;

const VARIABLES_BY_TEMPLATE: Record<TemplateKey, string[]> = {
  event_new: ["title", "location", "eventDate", "registrationDeadline", "link"],
  event_reminder: ["title", "location", "eventDate", "registrationDeadline"],
  registration_accepted: ["childName", "title", "eventDate", "location"],
  registration_rejected: ["childName", "title"],
  training_cancelled: ["message"],
  training_reminder: ["groupName", "sessionDate", "sessionTime"],
  news_published: ["title", "content"],
  gallery_published: ["title"],
};

export const TEMPLATE_WHEN: Record<TemplateKey, string> = {
  event_new: "Po dodaniu zawodów — gdy zaznaczysz „Powiadom SMS-em”.",
  event_reminder: "Ręcznie z panelu zawodów lub automatycznie dzień przed startem (cron).",
  registration_accepted: "Automatycznie po akceptacji zgłoszenia dziecka.",
  registration_rejected: "Automatycznie po odrzuceniu zgłoszenia.",
  training_cancelled: "Z listy zawodów — dzwonek → szablon „Odwołanie treningu”.",
  training_reminder: "Automatycznie dzień przed treningiem (cron o 18:00).",
  news_published: "Przy publikacji aktualności (gdy włączysz SMS).",
  gallery_published: "Po dodaniu zdjęcia do galerii — gdy włączysz powiadomienia.",
};

export const SMS_AUTO_TRIGGERS = [
  "Zgłoszenie dziecka — powiadomienie w aplikacji + push (automatycznie)",
  "Akceptacja / odrzucenie zgłoszenia — aplikacja + push (automatycznie)",
  "Nowe zawody / przypomnienie — aplikacja + push przy wysyłce z panelu",
  "Treningi — automatyczne przypomnienie dzień przed (cron)",
  "SMS — tylko gdy zaznaczysz opcję SMS i masz aktywne konto SMSAPI",
] as const;

export function getVariablesForTemplate(key: TemplateKey) {
  const allowed = new Set(VARIABLES_BY_TEMPLATE[key] || []);
  return TEMPLATE_VARIABLES.filter((item) => allowed.has(item.key));
}

export function technicalToFriendly(text: string) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const variable = TEMPLATE_VARIABLES.find((item) => item.key === key);
    return variable ? `[${variable.label}]` : `{{${key}}}`;
  });
}

export function friendlyToTechnical(text: string) {
  let result = text;

  for (const variable of TEMPLATE_VARIABLES) {
    result = result.replaceAll(`[${variable.label}]`, `{{${variable.key}}}`);
  }

  return result;
}

export function bodyTextToHtml(bodyText: string) {
  return bodyText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 12px">${line}</p>`)
    .join("");
}

export function insertAtCursor(
  value: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number
) {
  return {
    nextValue: value.slice(0, selectionStart) + insertion + value.slice(selectionEnd),
    cursor: selectionStart + insertion.length,
  };
}
