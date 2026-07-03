"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const userSnapshot = await getDocs(
        query(
          collection(db, "users"),
          where(
            "uid",
            "==",
            userCredential.user.uid
          )
        )
      );

      if (userSnapshot.empty) {
        alert("Nie znaleziono użytkownika.");
        return;
      }

      const userData =
        userSnapshot.docs[0].data();

      if (userData.rola === "admin") {
        router.push("/admin");
      } else {
        router.push("/moje-dzieci");
      }
    } catch (error) {
      console.error(error);
      alert("Błędny login lub hasło");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-3xl border border-yellow-500 w-full max-w-md">

        <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
          Logowanie
        </h1>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <button
            onClick={login}
            className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl"
          >
            Zaloguj
          </button>

        </div>

      </div>
    </main>
  );
}