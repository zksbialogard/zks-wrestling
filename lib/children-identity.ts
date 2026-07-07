export type ChildRecordFields = {
  imie: string;
  nazwisko: string;
  rokUrodzenia: string;
  plec?: string;
  kategoriaWagowa?: string;
  parentUid?: string;
  parentUids?: string[];
  identityKey?: string;
  grupaTreningowa?: string;
};

function normalizePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function buildChildIdentityKey(
  imie: string,
  nazwisko: string,
  rokUrodzenia: string
) {
  const year = rokUrodzenia.trim();
  return `${normalizePart(nazwisko)}-${normalizePart(imie)}-${year}`;
}

export function getChildIdentityKey(child: ChildRecordFields) {
  if (child.identityKey) {
    return child.identityKey;
  }

  return buildChildIdentityKey(child.imie, child.nazwisko, child.rokUrodzenia);
}

export type ParentLinkFields = Pick<ChildRecordFields, "parentUid" | "parentUids">;

export function getParentUids(child: ParentLinkFields): string[] {
  const fromArray = Array.isArray(child.parentUids)
    ? child.parentUids.filter(Boolean)
    : [];

  if (fromArray.length > 0) {
    return [...new Set(fromArray)];
  }

  if (child.parentUid) {
    return [child.parentUid];
  }

  return [];
}

export function isParentLinkedToChild(child: ParentLinkFields, parentUid: string) {
  return getParentUids(child).includes(parentUid);
}

export type MergedChild<T extends ChildRecordFields & { id: string }> = T & {
  parentUids: string[];
  duplicateIds: string[];
};

export function mergeChildrenByIdentity<T extends ChildRecordFields & { id: string }>(
  children: T[]
): MergedChild<T>[] {
  const map = new Map<string, MergedChild<T>>();

  for (const child of children) {
    const key = getChildIdentityKey(child);
    const parentUids = getParentUids(child);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        ...child,
        parentUids,
        duplicateIds: [],
      });
      continue;
    }

    existing.parentUids = [...new Set([...existing.parentUids, ...parentUids])];

    if (child.id !== existing.id) {
      existing.duplicateIds.push(child.id);
    }
  }

  return Array.from(map.values());
}

export function childIdentityPayload(
  imie: string,
  nazwisko: string,
  rokUrodzenia: string
) {
  const identityKey = buildChildIdentityKey(imie, nazwisko, rokUrodzenia);

  return {
    imie: imie.trim(),
    nazwisko: nazwisko.trim(),
    rokUrodzenia: rokUrodzenia.trim(),
    identityKey,
  };
}
