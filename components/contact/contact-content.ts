import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const contactIntro = {
  label: "Kontakt",
  title: "Porozmawiajmy",
  titleAccent: "o klubie",
  lead:
    "Masz pytania o treningi, zapisy lub zawody? Skontaktuj się z nami — chętnie pomożemy rodzicom i zawodnikom.",
};

export const clubContact = {
  name: "ZKS Białogard",
  street: "Grunwaldzka 46",
  city: "78-200 Białogard",
  phone: "790 335 967",
  phoneHref: "tel:+48790335967",
  email: "zksbialogard@wp.pl",
  mapsQuery: "Grunwaldzka 46, 78-200 Białogard",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grunwaldzka+46+78-200+Białogard",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Grunwaldzka+46,+78-200+Białogard&z=15&output=embed",
};

export const contactChannels = [
  {
    icon: MapPin,
    title: "Adres klubu",
    lines: [clubContact.street, clubContact.city],
    action: {
      label: "Otwórz w mapach",
      href: clubContact.mapsUrl,
      external: true,
    },
  },
  {
    icon: Phone,
    title: "Telefon",
    lines: [clubContact.phone],
    action: {
      label: "Zadzwoń",
      href: clubContact.phoneHref,
    },
  },
  {
    icon: Mail,
    title: "E-mail",
    lines: [clubContact.email],
    action: {
      label: "Napisz wiadomość",
      href: `mailto:${clubContact.email}`,
    },
  },
  {
    icon: Clock,
    title: "Godziny kontaktu",
    lines: ["Pon.–Pt.: 15:00 – 20:00"],
  },
];

export const contactTopics = [
  "Zapisy do klubu",
  "Treningi i grupy wiekowe",
  "Zawody i wyjazdy",
  "Współpraca / sponsorzy",
  "Inne",
];
