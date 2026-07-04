"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ParentHeader() {
  const [name, setName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        setName(snap.data().imie || "");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <header className="border-b border-yellow-500 bg-zinc-950">

      <div className="max-w-7xl mx-auto px-6 py-8">

        <h1 className="text-5xl font-bold text-yellow-400">
          Panel Rodzica
        </h1>

        <p className="text-gray-400 mt-2">
          Witaj {name || "Rodzicu"} 👋
        </p>

      </div>

    </header>
  );
}