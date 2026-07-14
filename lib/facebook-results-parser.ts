import { normalizeAthleteNameFromFacebook, isValidAthleteName, isNonAthleteName } from "./athlete-name-utils";
import type { FacebookPost, ParsedFacebookResult } from "./facebook-results-types";

const RESULT_KEYWORDS =
  /\b(wynik|wyniki|zawod|zawody|medal|mistrzostw|olimpiad|turniej|zapas|krążek|podium|puchar|memoriał|memorial)\b/i;

const MONTHS: Record<string, number> = {
  stycznia: 1,
  lutego: 2,
  marca: 3,
  kwietnia: 4,
  maja: 5,
  czerwca: 6,
  lipca: 7,
  sierpnia: 8,
  września: 9,
  października: 10,
  listopada: 11,
  grudnia: 12,
};

const MEDAL_PLACE: Record<string, number> = {
  złoto: 1,
  złoty: 1,
  złotą: 1,
  złote: 1,
  srebro: 2,
  srebrny: 2,
  srebrną: 2,
  srebrne: 2,
  brąz: 3,
  brązowy: 3,
  brązową: 3,
  brązowe: 3,
};

const ROMAN_PLACE: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
  xi: 11,
  xii: 12,
  xiii: 13,
  xiv: 14,
  xv: 15,
};

const NAME_PATTERN =
  "([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:-[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)?\\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)";

export function isResultPost(message: string) {
  return RESULT_KEYWORDS.test(message);
}

export function extractYearFromPost(post: FacebookPost) {
  const createdYear = new Date(post.created_time).getUTCFullYear();
  const messageYear = post.message?.match(/\b(20\d{2})\b/)?.[1];

  if (messageYear) {
    return Number(messageYear);
  }

  return createdYear;
}

export function extractEventDate(message: string, fallbackIso: string) {
  const crossMonthRange = message.match(
    /(\d{1,2})\.(\d{1,2})[–-](\d{1,2})\.(\d{1,2})\.(20\d{2})/
  );

  if (crossMonthRange) {
    return formatDate(
      Number(crossMonthRange[5]),
      Number(crossMonthRange[2]),
      Number(crossMonthRange[1])
    );
  }

  const dottedRange = message.match(/(\d{1,2})[–-](\d{1,2})\.(\d{1,2})\.(20\d{2})/);

  if (dottedRange) {
    return formatDate(
      Number(dottedRange[4]),
      Number(dottedRange[3]),
      Number(dottedRange[1])
    );
  }

  const dottedSingle = message.match(/(\d{1,2})\.(\d{1,2})\.(20\d{2})/);

  if (dottedSingle) {
    return formatDate(
      Number(dottedSingle[3]),
      Number(dottedSingle[2]),
      Number(dottedSingle[1])
    );
  }

  const rangeMatch = message.match(
    /(\d{1,2})[–-](\d{1,2})\.?\s*(\d{1,2})?\s*(stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)(?:\s+(20\d{2}))?/i
  );

  if (rangeMatch) {
    const day = Number(rangeMatch[1]);
    const month = MONTHS[rangeMatch[4].toLowerCase()];
    const year = rangeMatch[5] ? Number(rangeMatch[5]) : new Date(fallbackIso).getUTCFullYear();
    return formatDate(year, month, day);
  }

  const singleMatch = message.match(
    /(\d{1,2})\s+(stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)(?:\s+(20\d{2}))?/i
  );

  if (singleMatch) {
    const day = Number(singleMatch[1]);
    const month = MONTHS[singleMatch[2].toLowerCase()];
    const year = singleMatch[3] ? Number(singleMatch[3]) : new Date(fallbackIso).getUTCFullYear();
    return formatDate(year, month, day);
  }

  return fallbackIso.slice(0, 10);
}

export function extractEventTitle(message: string) {
  const lines = message
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const titleLine =
    lines.find((line) =>
      /(mistrzostw|olimpiad|turniej|memoriał|memorial|gala|zawod|puchar)/i.test(line)
    ) || lines[0];

  if (!titleLine) {
    return "Zawody";
  }

  return titleLine
    .replace(/[❗️🏆🥇🥈🥉]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export function extractLocation(message: string) {
  const locationMatch = message.match(
    /\b(?:w|we)\s+([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)?)\b/
  );

  return locationMatch?.[1] || "";
}

export function extractClubPlace(message: string): number | null {
  const teamWin = message.match(
    /wygrywamy\s+klasyfikacj[ęe]\s+drużynow[ąa]|wygrywamy\s+drużynow[oa]/i
  );

  if (teamWin) {
    return 1;
  }

  const teamPlace = message.match(
    /klasyfikacja\s+drużynowa[\s\S]{0,120}?i\s+miejsce\s+([A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż-]+)/i
  );

  if (teamPlace) {
    return 1;
  }

  const romanPlace = message.match(
    /(?:zajęliśmy|zajęli|wygraliśmy|zajmuje)\s+([IVX]+)\s+miejsce\s+drużynow/i
  );

  if (romanPlace) {
    return ROMAN_PLACE[romanPlace[1].toLowerCase()] || null;
  }

  return null;
}

type PatternSpec = {
  regex: RegExp;
  placeFromMatch: (match: RegExpMatchArray) => number;
  nameGroup: number;
};

export function parseResultsFromMessage(message: string): ParsedFacebookResult[] {
  const text = stripAcknowledgmentBlocks(normalizeResultMessage(message));
  const results: ParsedFacebookResult[] = [];
  const seen = new Set<string>();

  const patterns: PatternSpec[] = [
    {
      regex: new RegExp(
        `(złot[oyąe]|srebrn[ayąe]|brązow[ayąe])\\s+(?:medal|krążek)\\s+wywalczy(?:ł|ła)\\s+${NAME_PATTERN}`,
        "giu"
      ),
      placeFromMatch: (match) => MEDAL_PLACE[match[1].toLowerCase()] || 0,
      nameGroup: 2,
    },
    {
      regex: new RegExp(
        `(złot[oyąe]|srebrn[ayąe]|brązow[ayąe])\\s+krążek\\s+wywalczy(?:ł|ła)\\s+${NAME_PATTERN}`,
        "giu"
      ),
      placeFromMatch: (match) => MEDAL_PLACE[match[1].toLowerCase()] || 0,
      nameGroup: 2,
    },
    {
      regex: new RegExp(`(złoto|srebro|brąz)\\s*\\|\\s*${NAME_PATTERN}`, "giu"),
      placeFromMatch: (match) => MEDAL_PLACE[match[1].toLowerCase()] || 0,
      nameGroup: 2,
    },
    {
      regex: new RegExp(
        `(\\d+)\\.\\s*miejsce(?:\\s+zajęł[ao]|\\s+zajął[ao]|\\s+zajęli)?\\s*${NAME_PATTERN}`,
        "giu"
      ),
      placeFromMatch: (match) => Number(match[1]),
      nameGroup: 2,
    },
    {
      regex: new RegExp(`(\\d+)\\.\\s*miejsce\\s*\\|\\s*${NAME_PATTERN}`, "giu"),
      placeFromMatch: (match) => Number(match[1]),
      nameGroup: 2,
    },
    {
      regex: new RegExp(
        `(złot[oyąe]|srebrn[ayąe]|brązow[ayąe])\\s+medal\\s+zdoby(?:ł|ła|li)\\s+${NAME_PATTERN}`,
        "giu"
      ),
      placeFromMatch: (match) => MEDAL_PLACE[match[1].toLowerCase()] || 0,
      nameGroup: 2,
    },
    {
      regex: new RegExp(
        `${NAME_PATTERN}\\s+zajmuje\\s+([IVX]+|\\d+)\\.?\\s*miejsce`,
        "giu"
      ),
      placeFromMatch: (match) => parsePlaceToken(match[2]),
      nameGroup: 1,
    },
    {
      regex: new RegExp(
        `${NAME_PATTERN}[^\\n]{0,160}?zdoby(?:ł|ła|li)\\s+(złot[oyąe]|srebrn[ayąe]|brązow[ayąe])\\s+medal`,
        "giu"
      ),
      placeFromMatch: (match) => MEDAL_PLACE[match[2].toLowerCase()] || 0,
      nameGroup: 1,
    },
    {
      regex: new RegExp(
        `${NAME_PATTERN}[^\\n]{0,160}?zajęł[ao]\\s+([IVX]+|\\d+)\\.?\\s*miejsce`,
        "giu"
      ),
      placeFromMatch: (match) => parsePlaceToken(match[2]),
      nameGroup: 1,
    },
    {
      regex: new RegExp(
        `${NAME_PATTERN}[^\\n]{0,160}?zajmując\\s+([IVX]+|\\d+)\\.?\\s*miejsc`,
        "giu"
      ),
      placeFromMatch: (match) => parsePlaceToken(match[2]),
      nameGroup: 1,
    },
    {
      regex: new RegExp(
        `zwyciężył[ao]?\\s+${NAME_PATTERN}(?:[^\\n]{0,80}?(?:do|kat\\.?)\\s*(\\d+)\\s*kg)?`,
        "giu"
      ),
      placeFromMatch: () => 1,
      nameGroup: 1,
    },
    {
      regex: new RegExp(
        `(i|ii|iii|iv|v|vi|vii|viii|ix|x)\\s+miejsca?\\s+zajęli:?\\s*${NAME_PATTERN}`,
        "giu"
      ),
      placeFromMatch: (match) => ROMAN_PLACE[match[1].toLowerCase()] || 0,
      nameGroup: 2,
    },
    {
      regex: new RegExp(
        `ponadto\\s*:?\\s*${NAME_PATTERN}\\s+([IVX]+|\\d+)\\.?\\s*miejsce`,
        "giu"
      ),
      placeFromMatch: (match) => parsePlaceToken(match[2]),
      nameGroup: 1,
    },
  ];

  for (const { regex, placeFromMatch, nameGroup } of patterns) {
    for (const match of text.matchAll(regex)) {
      const place = placeFromMatch(match);
      const athleteName = normalizeAthleteName(match[nameGroup] || "");

      if (!place || !athleteName || isIgnoredAthleteName(athleteName) || !isValidAthleteName(athleteName)) continue;

      const weightClass = extractWeightClass(match[0]);
      const style = extractStyle(match[0]);
      const key = `${athleteName}::${place}::${style}`;

      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        athlete_name: athleteName,
        place,
        weight_class: weightClass,
        style,
      });
    }
  }

  results.push(...parseMedalListSections(text, seen));
  results.push(...parseInlinePlaceLines(text, seen));

  return results;
}

function parseMedalListSections(text: string, seen: Set<string>) {
  const results: ParsedFacebookResult[] = [];
  const sections: Array<{ place: number; header: RegExp }> = [
    { place: 1, header: /złot[eoyą]?\s+medal[eoyą]?\s+zdobyli/i },
    { place: 2, header: /srebrn[ayąe]?\s+medal[eoyą]?\s+zdobyli/i },
    { place: 3, header: /brązow[ayąe]?\s+medal[eoyą]?\s+zdobyli/i },
    { place: 1, header: /i\s+miejsca?\s+zajęli/i },
    { place: 2, header: /ii\s+miejsca?\s+zajęli/i },
    { place: 3, header: /iii\s+miejsca?\s+zajęli/i },
  ];

  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  let currentPlace = 0;

  for (const line of lines) {
    const section = sections.find((item) => item.header.test(line));
    if (section) {
      currentPlace = section.place;
      continue;
    }

    if (/podziękow|dziękuj|burmistrz|starost|wicestarost|zastępca|zastepca|gratulacj|oficjal|sponsor|patron|partner|fundac|fundusz|organizator|kurator|osir|mosir|federac|związek|zwiazek|wsparc|wspier|urząd|starostwo|samorząd|dotac|grant|hotel|media|marki/i.test(line)) {
      currentPlace = 0;
      continue;
    }

    if (!currentPlace) continue;

    if (!/(kg|styl|woln|klasyczn|medal|miejsce|\d+\.|\-|•|\*)/i.test(line) && extractNamesFromLine(line).length === 0) {
      continue;
    }

    const names = extractNamesFromLine(line);
    for (const name of names) {
      const key = `${name}::${currentPlace}::`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        athlete_name: name,
        place: currentPlace,
        weight_class: extractWeightClass(line),
        style: extractStyle(line),
      });
    }
  }

  return results;
}

function parseInlinePlaceLines(text: string, seen: Set<string>) {
  const results: ParsedFacebookResult[] = [];
  const linePattern = new RegExp(
    `^${NAME_PATTERN}\\s+([IVX]+|\\d+)\\.?\\s*miejsce`,
    "gimu"
  );

  for (const line of text.split(/\n+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    for (const match of trimmed.matchAll(linePattern)) {
      const athleteName = normalizeAthleteName(match[1] || "");
      const place = parsePlaceToken(match[2] || "");

      if (!athleteName || !place || isIgnoredAthleteName(athleteName) || !isValidAthleteName(athleteName)) continue;

      const key = `${athleteName}::${place}::`;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        athlete_name: athleteName,
        place,
        weight_class: extractWeightClass(trimmed),
        style: extractStyle(trimmed),
      });
    }
  }

  return results;
}

function extractNamesFromLine(line: string) {
  const cleaned = line
    .replace(/[🥇🥈🥉❗️🏆]+/g, " ")
    .replace(/^[-•*]\s*/, "")
    .trim();

  if (!cleaned || /^(złot|srebrn|brąz|i{1,3}\s+miejsce)/i.test(cleaned)) {
    return [];
  }

  const names: string[] = [];
  const nameRegex = new RegExp(NAME_PATTERN, "gu");

  for (const match of cleaned.matchAll(nameRegex)) {
    const name = normalizeAthleteName(match[1] || "");
    if (name && !isIgnoredAthleteName(name) && isValidAthleteName(name)) {
      names.push(name);
    }
  }

  return names;
}

function isIgnoredAthleteName(name: string) {
  const normalized = name.trim().toLowerCase();

  if (!normalized || normalized.length < 4) {
    return true;
  }

  if (/^(zks|uks|aks|ii|iii|iv|v|vi|vii|viii|ix|x|złoto|srebro|brąz)$/i.test(normalized)) {
    return true;
  }

  if (isNonAthleteName(name)) {
    return true;
  }

  return false;
}

function parsePlaceToken(value: string) {
  const trimmed = value.trim().toLowerCase();

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return ROMAN_PLACE[trimmed] || 0;
}

function normalizeResultMessage(message: string) {
  return message
    .replace(/\bBrązow/g, "brązow")
    .replace(/\bSrebrn/g, "srebrn")
    .replace(/\bZłot/g, "złot")
    .replace(/\bZłoto\b/g, "złoto")
    .replace(/\bSrebro\b/g, "srebro")
    .replace(/\bBrąz\b/g, "brąz")
    .replace(/[🥇🥈🥉❗️🏆]/g, " ");
}

function stripAcknowledgmentBlocks(message: string) {
  const lines = message.split(/\n+/);
  const kept: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (
      /podziękow|dziękuj|burmistrz|starost|wicestarost|zastępca|zastepca|marszałek|prezydent|urząd|starostwo|samorząd|wsparcie finansowe|wsparcie organizacyjne|gratulacj|oficjal|sponsor|patron|partner|fundac|fundusz|organizator|kurator|osir|mosir|federac|związek|zwiazek|minister|dotac|grant|biuro podróży|hotel|media|marki|wspieraj|wspier/i.test(
        line
      )
    ) {
      continue;
    }

    kept.push(line);
  }

  return kept.join("\n");
}

function normalizeAthleteName(value: string) {
  return normalizeAthleteNameFromFacebook(
    value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^oraz\s+/i, "")
      .replace(/[🥇🥈🥉❗️🏆]+/g, "")
      .trim()
  );
}

function extractWeightClass(fragment: string) {
  const match = fragment.match(/(?:do|kat\.?|kategorii\s+wagowej\s+do)\s*(\d+)\s*kg/i);
  return match?.[1] || "";
}

function extractStyle(fragment: string) {
  if (/stylu?\s+klasycznym/i.test(fragment)) return "styl klasyczny";
  if (/stylu?\s+wolnym/i.test(fragment)) return "styl wolny";
  return "";
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
