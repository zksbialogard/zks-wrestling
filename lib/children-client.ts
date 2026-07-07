import {
  arrayRemove,
  arrayUnion,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";

import {
  type ChildRecordFields,
  childIdentityPayload,
  getParentUids,
  isParentLinkedToChild,
} from "./children-identity";

export type StoredChild = ChildRecordFields & { id: string };

function parseChildDoc(id: string, data: Record<string, unknown>): StoredChild {
  const parentUids = getParentUids(data as ChildRecordFields);

  return {
    id,
    imie: String(data.imie ?? ""),
    nazwisko: String(data.nazwisko ?? ""),
    rokUrodzenia: String(data.rokUrodzenia ?? ""),
    plec: data.plec ? String(data.plec) : undefined,
    kategoriaWagowa: data.kategoriaWagowa ? String(data.kategoriaWagowa) : undefined,
    parentUid: data.parentUid ? String(data.parentUid) : parentUids[0],
    parentUids,
    identityKey: data.identityKey ? String(data.identityKey) : undefined,
    grupaTreningowa: data.grupaTreningowa ? String(data.grupaTreningowa) : undefined,
  };
}

export async function loadChildrenForParent(
  db: Firestore,
  parentUid: string
): Promise<StoredChild[]> {
  const [byPrimary, byLink] = await Promise.all([
    getDocs(query(collection(db, "children"), where("parentUid", "==", parentUid))),
    getDocs(
      query(collection(db, "children"), where("parentUids", "array-contains", parentUid))
    ),
  ]);

  const map = new Map<string, StoredChild>();

  for (const item of [...byPrimary.docs, ...byLink.docs]) {
    map.set(item.id, parseChildDoc(item.id, item.data()));
  }

  return Array.from(map.values());
}

export async function findChildByIdentityKey(db: Firestore, identityKey: string) {
  const snapshot = await getDocs(
    query(collection(db, "children"), where("identityKey", "==", identityKey))
  );

  if (snapshot.empty) {
    return null;
  }

  const item = snapshot.docs[0];
  return parseChildDoc(item.id, item.data());
}

export async function linkParentToChild(
  db: Firestore,
  childId: string,
  parentUid: string
) {
  const ref = doc(db, "children", childId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error("Nie znaleziono profilu zawodnika.");
  }

  const data = snapshot.data();

  if (isParentLinkedToChild(data as ChildRecordFields, parentUid)) {
    return parseChildDoc(childId, data);
  }

  await updateDoc(ref, {
    parentUids: arrayUnion(parentUid),
  });

  const updated = await getDoc(ref);
  return parseChildDoc(childId, updated.data() ?? {});
}

export async function unlinkParentFromChild(
  db: Firestore,
  childId: string,
  parentUid: string
) {
  const ref = doc(db, "children", childId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return;
  }

  const child = parseChildDoc(childId, snapshot.data());
  const parentUids = child.parentUids.filter((uid) => uid !== parentUid);

  if (parentUids.length === 0) {
    await deleteDoc(ref);
    return;
  }

  const nextPrimary = child.parentUid === parentUid ? parentUids[0] : child.parentUid;

  await updateDoc(ref, {
    parentUids: arrayRemove(parentUid),
    parentUid: nextPrimary,
  });
}

export async function createChildForParent(
  db: Firestore,
  parentUid: string,
  input: {
    imie: string;
    nazwisko: string;
    rokUrodzenia: string;
    plec: string;
    kategoriaWagowa: string;
    grupaTreningowa: string;
  }
) {
  const identity = childIdentityPayload(input.imie, input.nazwisko, input.rokUrodzenia);
  const existing = await findChildByIdentityKey(db, identity.identityKey);

  if (existing) {
    return linkParentToChild(db, existing.id, parentUid);
  }

  const docRef = await addDoc(collection(db, "children"), {
    ...input,
    ...identity,
    parentUid,
    parentUids: [parentUid],
    createdAt: new Date(),
  });

  return parseChildDoc(docRef.id, {
    ...input,
    ...identity,
    parentUid,
    parentUids: [parentUid],
  });
}
