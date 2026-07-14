export function splitAthleteName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length <= 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function joinAthleteName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

const COMMON_FIRST_NAMES = new Set([
  "alan",
  "aleksander",
  "artur",
  "borys",
  "filip",
  "hubert",
  "igor",
  "jeremi",
  "ksawery",
  "lena",
  "maja",
  "marcin",
  "marcel",
  "mateusz",
  "michał",
  "michal",
  "milena",
  "nadia",
  "natalia",
  "nikodem",
  "olek",
  "olivia",
  "oliwia",
  "robert",
  "szymon",
  "tymon",
  "wiktor",
  "wiwiana",
]);

const CANONICAL_ATHLETE_NAMES: Record<string, string> = {
  "klus mateusz": "Mateusz Klus",
};

function normalizeAthleteNameOrder(fullName: string) {
  const trimmed = fullName.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return "";
  }

  const parts = trimmed.split(" ");

  if (parts.length !== 2) {
    return trimmed;
  }

  const [first, second] = parts;
  const firstLower = first.toLowerCase();
  const secondLower = second.toLowerCase();

  if (COMMON_FIRST_NAMES.has(secondLower) && !COMMON_FIRST_NAMES.has(firstLower)) {
    return `${second} ${first}`;
  }

  return trimmed;
}

export function normalizeAthleteNameKey(fullName: string) {
  const normalized = normalizePolishChars(normalizeAthleteNameOrder(fullName))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "";
  }

  const parts = normalized.split(" ").filter(Boolean).sort();
  return parts.join(" ");
}

export function canonicalAthleteDisplayName(fullName: string) {
  const ordered = normalizeAthleteNameOrder(fullName);
  const key = normalizeAthleteNameKey(ordered);
  return CANONICAL_ATHLETE_NAMES[key] || ordered;
}

export function normalizeAthleteNameFromFacebook(fullName: string) {
  return canonicalAthleteDisplayName(fullName);
}

function normalizePolishChars(value: string) {
  return value
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ź/g, "z")
    .replace(/ż/g, "z");
}

function normalizeToken(token: string) {
  return normalizePolishChars(token)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

const OFFICIAL_TITLE_PATTERN =
  /burmistrz|starost|startost|wicestarost|zastepca|marszalk|prezydent|wojewod|ministr|dyrektor|prezes|radn|zarzad|podziek|dziekuj|oficjal|sponsor|patron|partner|fundac|fundusz|stowarzysz|organ|wspier|wsparc|gratulac|urzad|starostwo|samorzad|gmina|powiat|wojt|sekretarz|skarbnik|przewodnicz|komitet|organizator|sedzi|kurator|osir|mosir|federac|zwiazek|związek|olimp|dotac|grant|biuro|hotel|pensjon|media|marka|sklep|aptek|market|uczeln|uniwersyt|szkol|gimnaz|liceum|przedszk|turyst|phu|spolka|spółka|klub sport/i;

const GEOGRAPHIC_PATTERN =
  /bialogard|drawsk|drawna|polic|karlin|tychow|kolobrzeg|szczecin|zachodniopomorsk|wojewodztw|polsk|europ|osielsk|slawno|slawiensk|koszalin|swidwin|lobez|czaplinek|rega|debn|debrzno/i;

const ADMINISTRATIVE_TOKEN_PATTERN =
  /^(miasto|miasta|powiat|gminy|gminie|gmina|wojewodztwo|wojewodztwie|starosta|starosty|starostwo|burmistrz|burmistrza|zastepca|wicestarosta|marszalek|prezydent|wojt|sekretarz|skarbnik|przewodniczacy|przewodniczacy)$/i;

function cleanNameTokens(fullName: string) {
  return fullName
    .replace(/[,;]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[.:]+$/g, ""))
    .filter(Boolean);
}

function tokenLooksOfficial(token: string) {
  const normalized = normalizeToken(token);
  if (!normalized || normalized.length < 3) {
    return false;
  }

  if (OFFICIAL_TITLE_PATTERN.test(normalized)) {
    return true;
  }

  if (GEOGRAPHIC_PATTERN.test(normalized)) {
    return true;
  }

  if (ADMINISTRATIVE_TOKEN_PATTERN.test(normalized)) {
    return true;
  }

  if (/^(emilia|liderzy|zks|uks|aks|sponsor|patron|partner|fundacja|organizator|osir|mosir)$/.test(normalized)) {
    return true;
  }

  return false;
}

export function isNonAthleteName(fullName: string) {
  const normalized = normalizeAthleteNameFromFacebook(fullName).trim();
  if (!normalized) {
    return true;
  }

  const parts = cleanNameTokens(normalized);
  if (parts.length < 2) {
    return true;
  }

  const fullKey = normalizeToken(normalized);

  if (OFFICIAL_TITLE_PATTERN.test(fullKey) || GEOGRAPHIC_PATTERN.test(fullKey)) {
    return true;
  }

  if (parts.some((part) => tokenLooksOfficial(part))) {
    return true;
  }

  const normalizedParts = parts.map((part) => normalizeToken(part));
  if (normalizedParts.some((part) => ADMINISTRATIVE_TOKEN_PATTERN.test(part))) {
    return true;
  }

  if (normalizedParts.some((part) => /(?:ski|zki|cki|ny|ska|zko)$/.test(part) && GEOGRAPHIC_PATTERN.test(part))) {
    return true;
  }

  const knownFirstNames = parts.filter((part) =>
    COMMON_FIRST_NAMES.has(normalizeToken(part))
  );

  if (knownFirstNames.length === 0) {
    const first = normalizeToken(parts[0] || "");
    const second = normalizeToken(parts[1] || "");

    if (OFFICIAL_TITLE_PATTERN.test(first) || GEOGRAPHIC_PATTERN.test(second)) {
      return true;
    }

    if (/^(bialogardz|bialogardzk|bialogardu|drawsk|polic|karlin|tychow|kolobrzeg|szczecin)/.test(second)) {
      return true;
    }
  }

  return false;
}

export function isValidAthleteName(fullName: string) {
  const normalized = normalizeAthleteNameFromFacebook(fullName).trim();

  if (!normalized || normalized.length < 4) {
    return false;
  }

  if (isNonAthleteName(normalized)) {
    return false;
  }

  if (!/^[A-ZĄĆĘŁŃÓŚŹŻ]/.test(normalized)) {
    return false;
  }

  if (
    /^(zks|uks|aks|złoto|srebro|brąz|ii|iii|iv|v|vi|vii|viii|kg|miejsce|gdzie|najlepiej)$/i.test(
      normalized
    )
  ) {
    return false;
  }

  if (/\d{2,}/.test(normalized)) {
    return false;
  }

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return false;
  }

  return parts.every((part) => /^[A-ZĄĆĘŁŃÓŚŹŻ][A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż-]+$/.test(part));
}
