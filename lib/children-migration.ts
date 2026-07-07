import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import {
  childIdentityPayload,
  getChildIdentityKey,
  getParentUids,
  mergeChildrenByIdentity,
  type ChildRecordFields,
} from "./children-identity";
import { remapChildReferences } from "./children-migration-supabase";
import { getServerFirestore } from "./firestore-server";

export type ChildDoc = ChildRecordFields & { id: string };

export type DeduplicationGroup = {
  canonicalId: string;
  duplicateIds: string[];
  identityKey: string;
  label: string;
  parentUids: string[];
};

export type DeduplicationPlan = {
  totalChildren: number;
  duplicateGroups: DeduplicationGroup[];
  duplicateDocs: number;
};

export type DeduplicationResult = DeduplicationPlan & {
  mergedGroups: number;
  deletedDocs: number;
  registrationsRemapped: number;
  registrationsRemoved: number;
  resultsRemapped: number;
  errors: string[];
};

function parseChildDoc(id: string, data: Record<string, unknown>): ChildDoc {
  return {
    id,
    imie: String(data.imie ?? ""),
    nazwisko: String(data.nazwisko ?? ""),
    rokUrodzenia: String(data.rokUrodzenia ?? ""),
    plec: data.plec ? String(data.plec) : undefined,
    kategoriaWagowa: data.kategoriaWagowa ? String(data.kategoriaWagowa) : undefined,
    parentUid: data.parentUid ? String(data.parentUid) : undefined,
    parentUids: Array.isArray(data.parentUids)
      ? data.parentUids.map((item) => String(item)).filter(Boolean)
      : undefined,
    identityKey: data.identityKey ? String(data.identityKey) : undefined,
    grupaTreningowa: data.grupaTreningowa ? String(data.grupaTreningowa) : undefined,
  };
}

export async function loadAllChildren(): Promise<ChildDoc[]> {
  const snapshot = await getDocs(collection(getServerFirestore(), "children"));

  return snapshot.docs.map((item) => parseChildDoc(item.id, item.data()));
}

export function buildDeduplicationPlan(children: ChildDoc[]): DeduplicationPlan {
  const merged = mergeChildrenByIdentity(children);
  const duplicateGroups = merged
    .filter((item) => item.duplicateIds.length > 0)
    .map((item) => ({
      canonicalId: item.id,
      duplicateIds: item.duplicateIds,
      identityKey: getChildIdentityKey(item),
      label: `${item.imie} ${item.nazwisko} (${item.rokUrodzenia})`,
      parentUids: item.parentUids,
    }));

  return {
    totalChildren: children.length,
    duplicateGroups,
    duplicateDocs: duplicateGroups.reduce((sum, group) => sum + group.duplicateIds.length, 0),
  };
}

function pickCanonicalFields(canonical: ChildDoc, duplicates: ChildDoc[]) {
  const all = [canonical, ...duplicates];
  const identity = childIdentityPayload(
    canonical.imie,
    canonical.nazwisko,
    canonical.rokUrodzenia
  );

  const parentUids = [
    ...new Set(all.flatMap((child) => getParentUids(child))),
  ].filter(Boolean);

  const grupaTreningowa =
    all.find((child) => child.grupaTreningowa)?.grupaTreningowa || canonical.grupaTreningowa;

  const plec = all.find((child) => child.plec)?.plec || canonical.plec || "M";
  const kategoriaWagowa =
    all.find((child) => child.kategoriaWagowa)?.kategoriaWagowa ||
    canonical.kategoriaWagowa ||
    "";

  const parentUid =
    canonical.parentUid && parentUids.includes(canonical.parentUid)
      ? canonical.parentUid
      : parentUids[0];

  return {
    ...identity,
    plec,
    kategoriaWagowa,
    grupaTreningowa,
    parentUid,
    parentUids,
  };
}

export async function runChildrenDeduplication(): Promise<DeduplicationResult> {
  const children = await loadAllChildren();
  const plan = buildDeduplicationPlan(children);
  const childMap = new Map(children.map((child) => [child.id, child]));

  const result: DeduplicationResult = {
    ...plan,
    mergedGroups: 0,
    deletedDocs: 0,
    registrationsRemapped: 0,
    registrationsRemoved: 0,
    resultsRemapped: 0,
    errors: [],
  };

  if (!plan.duplicateGroups.length) {
    return result;
  }

  for (const group of plan.duplicateGroups) {
    try {
      const canonical = childMap.get(group.canonicalId);

      if (!canonical) {
        result.errors.push(`Brak dokumentu kanonicznego: ${group.canonicalId}`);
        continue;
      }

      const duplicates = group.duplicateIds
        .map((id) => childMap.get(id))
        .filter((item): item is ChildDoc => Boolean(item));

      const payload = pickCanonicalFields(canonical, duplicates);

      await updateDoc(doc(getServerFirestore(), "children", group.canonicalId), payload);

      for (const duplicateId of group.duplicateIds) {
        const remap = await remapChildReferences(group.canonicalId, duplicateId);

        result.registrationsRemapped += remap.registrationsRemapped;
        result.registrationsRemoved += remap.registrationsRemoved;
        result.resultsRemapped += remap.resultsRemapped;

        await deleteDoc(doc(getServerFirestore(), "children", duplicateId));
        result.deletedDocs += 1;
      }

      result.mergedGroups += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nieznany błąd scalania zawodnika.";
      result.errors.push(`${group.label}: ${message}`);
    }
  }

  return result;
}
