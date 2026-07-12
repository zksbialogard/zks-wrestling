import { signInAnonymously } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

import { auth, db } from "./firebase";

export async function loginAsGuest() {
  const credential = await signInAnonymously(auth);

  const snapshot = await getDocs(
    query(collection(db, "users"), where("uid", "==", credential.user.uid))
  );

  if (snapshot.empty) {
    await addDoc(collection(db, "users"), {
      uid: credential.user.uid,
      imie: "Gość",
      nazwisko: "",
      rola: "gosc",
      createdAt: new Date(),
    });
  }

  return credential.user;
}
