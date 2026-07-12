import XLSX from "xlsx";
import fs from "fs";

const EXCEL_PATH = "C:/Users/damwo/Downloads/ZKS -PLAN 2026.xlsx";
const OUTPUT_PATH = "data/plan-2026-events.json";

const MONTHS = [
  { num: 1, col: 0 },
  { num: 2, col: 3 },
  { num: 3, col: 6 },
  { num: 4, col: 9 },
  { num: 5, col: 12 },
  { num: 6, col: 15 },
  { num: 7, col: 18 },
  { num: 8, col: 21 },
  { num: 9, col: 24 },
  { num: 10, col: 27 },
  { num: 11, col: 30 },
  { num: 12, col: 33 },
];

const HOLIDAY_PREFIX =
  /^(nowy rok|święto|boże|wielkanoc|poniedziałek|uroczystość|narodowe|wniebowzięcie|wigilia)/i;

function dateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function subtractDays(dateKeyValue, days) {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - days);
  return dateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

function titleCaseLocation(value) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseAgeCategory(text) {
  const normalized = text.toUpperCase();
  if (/\bU\s*20\b/.test(normalized) || /\(17[\s–-]*20/.test(normalized)) return "U20";
  if (/\bU\s*17\b/.test(normalized)) return "U17";
  if (/\bU\s*15\b/.test(normalized)) return "U15";
  if (/\bU\s*14\b/.test(normalized)) return "U14";
  if (/12[\s–-]*14/.test(normalized)) return "U12–14";
  return null;
}

function isZgrupowanie(text) {
  return /zgrupowanie/i.test(text);
}

function normalizeExcelEvent(text) {
  return text.replace(/\s+/g, " ").trim();
}

function toEventPayload(rawText, eventDate) {
  const text = normalizeExcelEvent(rawText);
  const ageCategory = parseAgeCategory(text);

  if (isZgrupowanie(text)) {
    const locationMatch = text.match(/zgrupowanie\s+(.+)$/i);
    const location = titleCaseLocation(locationMatch?.[1] || "Polska");

    return {
      title: `Zgrupowanie — ${location}`,
      location,
      event_date: eventDate,
      end_date: null,
      event_type: "zgrupowanie",
      age_category: null,
      season: 2026,
      registration_deadline: eventDate,
    };
  }

  const locationFromDash = text.match(/(?:—|-)\s*([A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż .-]+)$/i);
  const knownLocations = [
    "Włodawa",
    "Chęciny",
    "Spała",
    "Łódź",
    "Stróża",
    "Stargard",
    "Bielawa",
    "Osielsko",
    "Białogard",
    "Kraśnik",
    "Pelplin",
    "Międzyzdroje",
    "Wolin",
    "Świdwin",
    "Karlino",
    "Szczecin",
    "Kołobrzeg",
  ];

  let location = "Polska";
  let title = text;

  for (const candidate of knownLocations) {
    if (text.toUpperCase().includes(candidate.toUpperCase())) {
      location = candidate;
      break;
    }
  }

  if (locationFromDash) {
    location = titleCaseLocation(locationFromDash[1].trim());
  }

  if (/^OSIELSKO$/i.test(text)) {
    title = "Turniej — Osielsko";
    location = "Osielsko";
  } else if (/^KRAŚNIK$/i.test(text)) {
    title = "Turniej — Kraśnik";
    location = "Kraśnik";
  } else if (/^PELPLIN$/i.test(text) && !/Mistrzostwa Polski LZS/i.test(text)) {
    title = "Turniej — Pelplin";
    location = "Pelplin";
  } else if (/MIĘDZYZDROJE/i.test(text)) {
    title = "Turniej — Międzyzdroje";
    location = "Międzyzdroje";
  } else if (/^WOLIN$/i.test(text)) {
    title = "Turniej — Wolin";
    location = "Wolin";
  } else if (/^ŚWIDWIN$/i.test(text)) {
    title = "Turniej — Świdwin";
    location = "Świdwin";
  } else if (/^KARLINO$/i.test(text)) {
    title = "Turniej — Karlino";
    location = "Karlino";
  } else if (/^SZCZECIN$/i.test(text)) {
    title = "Turniej — Szczecin";
    location = "Szczecin";
  } else if (/^KOŁOBRZEG$/i.test(text)) {
    title = "Turniej — Kołobrzeg";
    location = "Kołobrzeg";
  } else if (/^BIAŁOGARD$/i.test(text)) {
    title = "Zawody — Białogard";
    location = "Białogard";
  } else if (/Mistrzostwa Polski U15/i.test(text)) {
    title = "Mistrzostwa Polski U15";
    location = "Polska";
  } else if (/Turniej Nadziei Olimpijskich/i.test(text)) {
    title = "Turniej Nadziei Olimpijskich";
    location = "Polska";
  } else if (/U20 \(17-20 lat\)/i.test(text)) {
    title = "Turniej U20 (17–20 lat)";
    location = "Polska";
  } else if (/II Puchar Polski\s+U17/i.test(text)) {
    title = "II Puchar Polski U17";
    location = "Polska";
  } else if (/Mistrzostwa Polski juniorów U20/i.test(text)) {
    title = "Mistrzostwa Polski juniorów U20 — Włodawa";
    location = "Włodawa";
  } else if (/Mistrzostwa Polsk i juniorek U20/i.test(text)) {
    title = "Mistrzostwa Polski juniorek U20 — Chęciny";
    location = "Chęciny";
  } else if (/EURO CUP/i.test(text)) {
    title = "EURO CUP";
    location = "Polska";
  } else if (/BIELAWA\s*-\s*U14/i.test(text)) {
    title = "Bielawa — U14";
    location = "Bielawa";
  } else if (/Ogólnopolska Olimpiada Młodzieży U\s*17/i.test(text)) {
    title = "Ogólnopolska Olimpiada Młodzieży U17 — Spała";
    location = "Spała";
  } else if (/MMM \(12-14 lat\)/i.test(text)) {
    title = "MMM (12–14 lat) — Stargard";
    location = "Stargard";
  } else if (/Mistrzostwa Polski Młodzików U14/i.test(text)) {
    title = "Mistrzostwa Polski Młodzików U14 — Łódź";
    location = "Łódź";
  } else if (/Mistrzostwa Polski Młodziczek U14/i.test(text)) {
    title = "Mistrzostwa Polski Młodziczek U14 — Stróża";
    location = "Stróża";
  } else if (/Mistrzostwa Polski LZS/i.test(text)) {
    title = "Mistrzostwa Polski LZS — Pelplin";
    location = "Pelplin";
  } else if (/Miistrzoostwa szkół podstawowych/i.test(text)) {
    title = "Mistrzostwa szkół podstawowych";
    location = "Polska";
  } else if (location !== "Polska") {
    title = `Turniej — ${location}`;
  }

  const payload = {
    title,
    location,
    event_date: eventDate,
    end_date: null,
    event_type: "zawody",
    age_category: ageCategory,
    season: 2026,
    registration_deadline: subtractDays(eventDate, 8),
  };

  if (/Ogólnopolska Olimpiada Młodzieży U\s*17/i.test(text)) {
    payload.end_date = subtractDays(eventDate, -3);
  }

  return payload;
}

function parseExcelCalendar() {
  const wb = XLSX.readFile(EXCEL_PATH);
  const sheet = wb.Sheets["Kalendarz zawodów 2026"];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
  const events = [];

  for (const month of MONTHS) {
    for (let row = 4; row < data.length; row++) {
      const day = row - 3;
      if (day < 1 || day > 31) continue;

      const eventCell = data[row]?.[month.col + 1];
      if (!eventCell || typeof eventCell !== "string") continue;

      const text = normalizeExcelEvent(eventCell);
      if (!text || /^\d+$/.test(text) || HOLIDAY_PREFIX.test(text)) continue;

      const eventDate = dateKey(2026, month.num, day);
      events.push(toEventPayload(text, eventDate));
    }
  }

  return events.sort((a, b) => a.event_date.localeCompare(b.event_date));
}

const events = parseExcelCalendar();
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(events, null, 2)}\n`, "utf8");

console.log(`Wrote ${events.length} events to ${OUTPUT_PATH}`);
for (const event of events) {
  console.log(`${event.event_date} | ${event.title}`);
}
