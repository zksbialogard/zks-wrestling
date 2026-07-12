export function normalizeFacebookEventTitle(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[❗️🏆🥇🥈🥉]+/g, " ")
    .replace(/[^a-z0-9ąćęłńóśźż\s]/gi, " ")
    .replace(
      /\b(w\s|we\s|nasz\s+klub|kolejne\s+sukcesy|z\s+ogromna\s+przyjemnoscia|to\s+byl\s+bardzo|podczas|tym\s+razem)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function extractEventSignature(title: string) {
  const normalized = normalizeFacebookEventTitle(title);
  const parts: string[] = [];

  if (/mistrzostw/.test(normalized)) parts.push("mp");
  if (/miedzynarodow/.test(normalized)) parts.push("intl");
  if (/mlodzik/.test(normalized)) parts.push("mlodziki");
  if (/mlodziczk/.test(normalized)) parts.push("mlodziczki");
  if (/juniork/.test(normalized)) parts.push("juniorki");
  if (/kadet/.test(normalized)) parts.push("kadeci");
  if (/u15|u-15/.test(normalized)) parts.push("u15");
  if (/u20|u-20/.test(normalized)) parts.push("u20");
  if (/olimpiad/.test(normalized)) parts.push("olimpiada");
  if (/memorial|memoriał/.test(normalized)) parts.push("memorial");
  if (/puchar/.test(normalized)) parts.push("puchar");
  if (/turniej/.test(normalized)) parts.push("turniej");
  if (/wojewódz|wojewodz/.test(normalized)) parts.push("wojewodzkie");
  if (/miedzywojewódz|miedzywojewodz/.test(normalized)) parts.push("miedzywojewodzkie");

  const locations = [
    "bialogard",
    "bielawa",
    "osielsko",
    "spala",
    "karlin",
    "siedlce",
    "kielce",
    "swidwin",
    "stargard",
    "checiny",
    "koronowo",
    "kolobrzeg",
  ];

  for (const location of locations) {
    if (normalized.includes(location)) {
      parts.push(location);
    }
  }

  if (parts.length) {
    return [...new Set(parts)].sort().join("+");
  }

  const tokens = normalized
    .split(" ")
    .filter((word) => word.length > 3)
    .slice(0, 6);

  return tokens.join("+") || "zawody";
}

export function buildFacebookEventGroupKey(
  eventTitle: string,
  eventDate?: string | null
) {
  const signature = extractEventSignature(eventTitle);
  const date = eventDate?.slice(0, 10) || "unknown-date";
  return `${date}::${signature}`;
}
export function preferCanonicalFacebookPostId(postIds: string[]) {
  const unique = [...new Set(postIds.filter(Boolean))];
  const seed = unique.find((id) => id.startsWith("seed-"));
  if (seed) return seed;

  const numeric = unique.find((id) => /^\d+$/.test(id));
  if (numeric) return numeric;

  return unique.sort((a, b) => a.length - b.length)[0] || "";
}

export function preferCanonicalEventTitle(titles: string[]) {
  const unique = [...new Set(titles.map((title) => title.trim()).filter(Boolean))];
  if (!unique.length) return "Zawody";

  return unique.sort((a, b) => {
    const aScore = scoreEventTitle(a);
    const bScore = scoreEventTitle(b);
    if (aScore !== bScore) return bScore - aScore;
    return a.length - b.length;
  })[0];
}

function scoreEventTitle(title: string) {
  let score = 0;
  if (/mistrzostw|olimpiad|turniej|memoriał|memorial|puchar/i.test(title)) score += 4;
  if (title.length < 120) score += 2;
  if (!/kolejne|świetne|bardzo|gospodarzami/i.test(title)) score += 2;
  return score;
}

export function isResultsNewsTitle(title: string) {
  return /^wyniki zawodów:/i.test(title.trim());
}

export function datesWithinRange(
  left?: string | null,
  right?: string | null,
  maxDays = 3
) {
  if (!left || !right) {
    return false;
  }

  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();

  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return false;
  }

  const diffDays = Math.abs(leftTime - rightTime) / (1000 * 60 * 60 * 24);
  return diffDays <= maxDays;
}

export function isSameCompetitionEvent(
  leftTitle: string,
  leftDate: string | null | undefined,
  rightTitle: string,
  rightDate: string | null | undefined
) {
  const leftSignature = extractEventSignature(leftTitle);
  const rightSignature = extractEventSignature(rightTitle);

  if (leftSignature !== rightSignature) {
    return false;
  }

  if (!leftDate || !rightDate) {
    return true;
  }

  if (leftDate.slice(0, 10) === rightDate.slice(0, 10)) {
    return true;
  }

  return datesWithinRange(leftDate, rightDate);
}
