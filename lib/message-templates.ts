export type TemplateKey =
  | "event_new"
  | "event_reminder"
  | "registration_accepted"
  | "registration_rejected"
  | "training_cancelled"
  | "training_reminder"
  | "news_published";

export type MessageTemplate = {
  key: TemplateKey;
  name: string;
  subject: string;
  body_text: string;
  body_html: string;
  sms_text: string;
  push_title: string;
  push_body: string;
};

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    key: "event_new",
    name: "Nowe zawody",
    subject: "ZKS Białogard — {{title}}",
    body_text:
      "ZKS Białogard — nowe zawody: {{title}}. Miejsce: {{location}}. Data: {{eventDate}}. Zapisy do: {{registrationDeadline}}. Zaloguj się do aplikacji, aby zgłosić dziecko.",
    body_html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2 style="color:#d4af37">ZKS Białogard — nowe zawody</h2><p><strong>{{title}}</strong></p><p>Miejsce: {{location}}</p><p>Data zawodów: {{eventDate}}</p><p>Termin zgłoszeń: {{registrationDeadline}}</p><p><a href="{{link}}">Zgłoś dziecko w aplikacji</a></p></div>`,
    sms_text:
      "ZKS Białogard: nowe zawody {{title}}, {{location}}, {{eventDate}}. Zapisy do {{registrationDeadline}}.",
    push_title: "Nowe zawody — {{title}}",
    push_body: "{{location}} · {{eventDate}}. Zapisy do {{registrationDeadline}}.",
  },
  {
    key: "event_reminder",
    name: "Przypomnienie o zawodach",
    subject: "ZKS Białogard — przypomnienie: {{title}}",
    body_text:
      "Przypomnienie: zawody {{title}} odbędą się {{eventDate}} w {{location}}. Termin zgłoszeń: {{registrationDeadline}}.",
    body_html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2 style="color:#d4af37">Przypomnienie o zawodach</h2><p><strong>{{title}}</strong></p><p>Miejsce: {{location}}</p><p>Data: {{eventDate}}</p><p>Termin zgłoszeń: {{registrationDeadline}}</p></div>`,
    sms_text: "ZKS Białogard: przypomnienie — {{title}}, {{eventDate}}, {{location}}.",
    push_title: "Przypomnienie — {{title}}",
    push_body: "{{eventDate}} · {{location}}",
  },
  {
    key: "registration_accepted",
    name: "Zgłoszenie zaakceptowane",
    subject: "ZKS Białogard — zgłoszenie potwierdzone",
    body_text:
      "Zgłoszenie {{childName}} na zawody {{title}} zostało zaakceptowane. Data: {{eventDate}}, miejsce: {{location}}.",
    body_html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2 style="color:#d4af37">Zgłoszenie potwierdzone</h2><p>Zawodnik: <strong>{{childName}}</strong></p><p>Zawody: {{title}}</p><p>Data: {{eventDate}}</p><p>Miejsce: {{location}}</p></div>`,
    sms_text: "ZKS Białogard: zgłoszenie {{childName}} na {{title}} zaakceptowane.",
    push_title: "Zgłoszenie potwierdzone",
    push_body: "{{childName}} — {{title}}",
  },
  {
    key: "registration_rejected",
    name: "Zgłoszenie odrzucone",
    subject: "ZKS Białogard — zgłoszenie odrzucone",
    body_text:
      "Zgłoszenie {{childName}} na zawody {{title}} nie zostało przyjęte. Skontaktuj się z klubem w razie pytań.",
    body_html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2 style="color:#d4af37">Zgłoszenie odrzucone</h2><p>Zawodnik: {{childName}}</p><p>Zawody: {{title}}</p><p>W razie pytań skontaktuj się z klubem.</p></div>`,
    sms_text: "ZKS Białogard: zgłoszenie {{childName}} na {{title}} odrzucone.",
    push_title: "Zgłoszenie odrzucone",
    push_body: "{{childName}} — {{title}}",
  },
  {
    key: "training_cancelled",
    name: "Odwołanie treningu",
    subject: "ZKS Białogard — odwołany trening",
    body_text: "{{message}}",
    body_html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2 style="color:#d4af37">Odwołany trening</h2><p>{{message}}</p></div>`,
    sms_text: "ZKS Białogard: {{message}}",
    push_title: "Odwołany trening",
    push_body: "{{message}}",
  },
  {
    key: "training_reminder",
    name: "Przypomnienie o treningu",
    subject: "ZKS Białogard — przypomnienie o treningu",
    body_text:
      "Przypomnienie: jutro trening {{groupName}} ({{sessionDate}}) o godz. {{sessionTime}}.",
    body_html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2 style="color:#d4af37">Przypomnienie o treningu</h2><p>Jutro trening <strong>{{groupName}}</strong>.</p><p>Data: {{sessionDate}}</p><p>Godziny: {{sessionTime}}</p></div>`,
    sms_text: "ZKS Białogard: jutro trening {{groupName}}, {{sessionTime}}.",
    push_title: "Trening jutro — {{groupName}}",
    push_body: "{{sessionDate}} · {{sessionTime}}",
  },
  {
    key: "news_published",
    name: "Nowa aktualność",
    subject: "ZKS Białogard — {{title}}",
    body_text: "{{title}} — {{content}}",
    body_html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2 style="color:#d4af37">{{title}}</h2><p>{{content}}</p></div>`,
    sms_text: "ZKS Białogard — aktualność: {{title}}",
    push_title: "{{title}}",
    push_body: "{{content}}",
  },
];

export function renderTemplate(
  template: string,
  variables: Record<string, string>
) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? "");
}

export function getDefaultTemplate(key: TemplateKey) {
  const template = DEFAULT_TEMPLATES.find((item) => item.key === key);

  if (!template) {
    throw new Error(`Nie znaleziono szablonu: ${key}`);
  }

  return template;
}
