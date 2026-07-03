"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Błąd wylogowania:", error);
    }
  };

  const cards = [
    {
      title: "🏆 Zawody",
      description: "Dodawanie, edycja i zarządzanie zawodami",
      href: "/admin/zawody",
    },
    {
      title: "📋 Zgłoszenia",
      description: "Przegląd i akceptacja zgłoszeń zawodników",
      href: "/admin/zgloszenia",
    },
    {
      title: "👦 Dzieci",
      description: "Lista wszystkich zawodników zapisanych w klubie",
      href: "/admin/dzieci",
    },
    {
      title: "👥 Użytkownicy",
      description: "Zarządzanie kontami rodziców i zawodników",
      href: "/admin/uzytkownicy",
    },
    {
      title: "📰 Aktualności",
      description: "Dodawanie i edycja aktualności klubowych",
      href: "/admin/aktualnosci",
    },
    {
      title: "🖼 Galeria",
      description: "Dodawanie zdjęć do galerii klubowej",
      href: "/admin/galeria",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-400">
              Panel Administratora
            </h1>

            <p className="text-gray-400 mt-2">
              Zarządzanie klubem ZKS Białogard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="
              bg-red-600
              hover:bg-red-500
              px-6
              py-3
              rounded-2xl
              font-bold
              transition
            "
          >
            Wyloguj
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="
                bg-zinc-900
                border
                border-yellow-500
                rounded-3xl
                p-8
                hover:bg-zinc-800
                hover:scale-[1.02]
                transition
                shadow-lg
              "
            >
              <h2 className="text-2xl font-bold text-yellow-400">
                {card.title}
              </h2>

              <p className="text-gray-300 mt-4">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}