"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RejestracjaPage() {
  const router = useRouter();

  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [zgoda, setZgoda] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = async () => {
    try {
      if (!imie || !nazwisko || !telefon || !email || !haslo) {
        alert("Uzupełnij wszystkie pola.");
        return;
      }

      if (telefon.length !== 9) {
        alert("Numer telefonu musi mieć 9 cyfr.");
        return;
      }

      if (!zgoda) {
        alert(
          "Musisz zaakceptować regulamin i zgodę na przetwarzanie danych."
        );
        return;
      }

      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          haslo
        );

      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        imie,
        nazwisko,
        telefon,
        email,
        rola: "rodzic",
        createdAt: new Date(),
      });

      alert("Konto zostało utworzone.");

      router.push("/login");
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("Ten adres e-mail jest już używany.");
      } else if (error.code === "auth/weak-password") {
        alert("Hasło musi mieć minimum 6 znaków.");
      } else if (error.code === "auth/invalid-email") {
        alert("Nieprawidłowy adres e-mail.");
      } else {
        alert("Wystąpił błąd podczas rejestracji.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-start justify-center pt-40 px-6">
      <div className="w-full max-w-xl bg-zinc-900 border border-yellow-500 rounded-3xl p-8">

        <h1 className="text-5xl font-bold text-yellow-400 text-center mb-4">
          Załóż konto
        </h1>

        <p className="text-center text-gray-400 mb-8">
         
        </p>

        <div className="space-y-4">

          <input
            type="text"
            name="imie"
            autoComplete="off"
            placeholder="Imię"
            value={imie}
            onChange={(e) => setImie(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500 outline-none"
          />

          <input
            type="text"
            name="nazwisko"
            autoComplete="off"
            placeholder="Nazwisko"
            value={nazwisko}
            onChange={(e) => setNazwisko(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500 outline-none"
          />

          <input
            type="tel"
            name="telefon"
            autoComplete="off"
            placeholder="Telefon"
            value={telefon}
            onChange={(e) =>
              setTelefon(
                e.target.value.replace(/\D/g, "").slice(0, 9)
              )
            }
            className="w-full p-4 rounded-xl bg-black border border-yellow-500 outline-none"
          />

          <input
            type="email"
            name="email"
            autoComplete="off"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500 outline-none"
          />

          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Hasło"
            value={haslo}
            onChange={(e) => setHaslo(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500 outline-none"
          />

          <label className="flex items-start gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={zgoda}
              onChange={(e) => setZgoda(e.target.checked)}
              className="mt-1"
            />

            <span>
              Akceptuję regulamin oraz wyrażam zgodę na
              przetwarzanie danych osobowych w celu
              korzystania z aplikacji ZKS Białogard.
            </span>
          </label>

          <button
            onClick={register}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition"
          >
            {loading
              ? "Tworzenie konta..."
              : "Załóż konto"}
          </button>

          <div className="pt-4 border-t border-zinc-700">

            <p className="text-center text-gray-400 mb-3">
              Masz już konto?
            </p>

            <button
              onClick={() => router.push("/login")}
              className="w-full border border-yellow-500 text-yellow-400 font-bold py-4 rounded-xl hover:bg-yellow-500 hover:text-black transition"
            >
              Zaloguj się
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}