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
  const normalized = normalizeAthleteNameOrder(fullName)
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

export function isValidAthleteName(fullName: string) {
  const normalized = normalizeAthleteNameFromFacebook(fullName).trim();

  if (!normalized || normalized.length < 4) {
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
