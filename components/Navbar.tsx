"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ZKS Białogard"
              width={50}
              height={50}
              priority
            />

            <div>
              <h1 className="text-yellow-400 font-bold text-lg">
                ZKS Białogard
              </h1>

              <p className="text-gray-300 text-xs">
                Klub Zapaśniczy
              </p>
            </div>
          </Link>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center gap-6 text-white font-medium">

            <Link
              href="/"
              className="hover:text-yellow-400 transition duration-200"
            >
              Strona główna
            </Link>

            <Link
              href="/zawody/najblizsze-zawody"
              className="hover:text-yellow-400 transition duration-200"
            >
              Najbliższe zawody
            </Link>

            <Link
              href="/zawody/kalendarz-startow"
              className="hover:text-yellow-400 transition duration-200"
            >
              Kalendarz startów
            </Link>

            <Link
              href="/zawody/wyniki-zawodow"
              className="hover:text-yellow-400 transition duration-200"
            >
              Wyniki zawodów
            </Link>

            <Link
              href="/klub/o-klubie"
              className="hover:text-yellow-400 transition duration-200"
            >
              O Klubie
            </Link>

            <Link
              href="/klub/historia-klubu"
              className="hover:text-yellow-400 transition duration-200"
            >
              Historia Klubu
            </Link>

            <Link
              href="/galeria"
              className="hover:text-yellow-400 transition duration-200"
            >
              Galeria
            </Link>

            <Link
              href="/kontakt"
              className="hover:text-yellow-400 transition duration-200"
            >
              Kontakt
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
}