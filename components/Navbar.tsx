"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
const [menuOpen, setMenuOpen] = useState(false);
const [user, setUser] = useState<any>(null);
const [role, setRole] = useState("");

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    console.log("AUTH UID:", currentUser?.uid);

    if (currentUser) {
      const userDoc = await getDoc(
        doc(db, "users", currentUser.uid)
      );
      console.log("DOCUMENT EXISTS:", userDoc.exists());

if (userDoc.exists()) {
  console.log("USER DATA:", userDoc.data());
  console.log("ROLA:", userDoc.data().rola);
}

     if (userDoc.exists()) {
  const data = userDoc.data();

  console.log("USER DATA:", data);
  console.log("ROLA:", data.rola);

  setRole(data.rola || "");
}
    } else {
      setRole("");
    }
  });

  return () => unsubscribe();
}, []);

const handleLogout = async () => {
  await signOut(auth);
  window.location.href = "/";
};

return (
<> <nav className="sticky top-0 z-[100000] bg-black border-b border-yellow-500"> <div className="max-w-7xl mx-auto px-4"> <div className="flex items-center justify-between h-20">

        {/* Hamburger mobile */}
        <button
  type="button"
  onClick={() => setMenuOpen((prev) => !prev)}
  className="md:hidden text-yellow-400 text-3xl z-[100000] relative"
>
  ☰
</button>

        {/* Logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
        >
          <Image
            src="/logo.png"
            alt="ZKS Białogard"
            width={80}
            height={80}
            priority
          />
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6 text-white">
          <Link href="/">Strona główna</Link>
          <Link href="/zawody/najblizsze-zawody">Najbliższe zawody</Link>
          <Link href="/zawody/wyniki-zawodow">Wyniki zawodów</Link>
          <Link href="/klub/o-klubie">O klubie</Link>
          <Link href="/galeria">Galeria</Link>
          <Link href="/kontakt">Kontakt</Link>
        </div>

        <div className="hidden md:block w-10"></div>
      </div>
    </div>
  </nav>

  {/* Overlay */}
  {menuOpen && (
    <div
      onClick={() => setMenuOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 99998,
      }}
    />
  )}

  {/* Mobile Menu */}
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "280px",
      height: "100vh",
      background: "#111111",
      borderRight: "2px solid #facc15",
      zIndex: 99999,
      transform: menuOpen
        ? "translateX(0)"
        : "translateX(-100%)",
      transition: "transform 0.3s ease",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        borderBottom: "1px solid #facc15",
      }}
    >
      <span
        style={{
          color: "#facc15",
          fontWeight: "bold",
          fontSize: "20px",
        }}
      >
        MENU
      </span>

      <button
        onClick={() => setMenuOpen(false)}
        style={{
          color: "#facc15",
          fontSize: "28px",
        }}
      >
        ✕
      </button>
    </div>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "20px",
        color: "white",
      }}
    >
      <Link href="/" onClick={() => setMenuOpen(false)}>
        🏠 Strona główna
      </Link>

      <Link
        href="/zawody/najblizsze-zawody"
        onClick={() => setMenuOpen(false)}
      >
        🤼 Najbliższe zawody
      </Link>

      <Link
        href="/zawody/wyniki-zawodow"
        onClick={() => setMenuOpen(false)}
      >
        🏅 Wyniki zawodów
      </Link>

      <Link
        href="/klub/o-klubie"
        onClick={() => setMenuOpen(false)}
      >
        💪 O klubie
      </Link>

      <Link
        href="/galeria"
        onClick={() => setMenuOpen(false)}
      >
        📸 Galeria
      </Link>

      <Link
        href="/kontakt"
        onClick={() => setMenuOpen(false)}
      >
        📞 Kontakt
      </Link>

      <hr />

{!user && (
  <>
    <Link
      href="/login"
      onClick={() => setMenuOpen(false)}
    >
      🔐 Zaloguj
    </Link>

    <Link
      href="/rejestracja"
      onClick={() => setMenuOpen(false)}
    >
      📝 Załóż konto
    </Link>
  </>
)}

{user && (
  <>
  
    {role === "rodzic" && (
  <Link
    href="/moje-dzieci"
    onClick={() => setMenuOpen(false)}
  >
    👦 Moje dzieci
  </Link>
)}

    {role === "admin" && (
      <Link
        href="/admin"
        onClick={() => setMenuOpen(false)}
      >
        ⚙️ Panel administratora
      </Link>
    )}

    <button
      onClick={handleLogout}
      style={{
        textAlign: "left",
        color: "#ef4444",
        fontWeight: "bold",
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      🚪 Wyloguj
    </button>
  </>
)}
      <a
  href="https://www.facebook.com/zksbialogard"
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => setMenuOpen(false)}
>
  📘 Facebook
</a>
    </div>
  </div>
</>

);
}
