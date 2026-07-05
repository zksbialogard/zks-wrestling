"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Logo from "./Logo";
import NavbarMenu from "./NavbarMenu";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const hideOnPanel =
    pathname.startsWith("/admin") || pathname.startsWith("/panel-rodzica");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (hideOnPanel) {
    return null;
  }

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-zks-gold-mid/20 bg-zks-black/95 shadow-lg shadow-black/40 backdrop-blur-xl"
          : "bg-gradient-to-b from-zks-black/80 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-4">
        <MobileMenu onLogout={handleLogout} />

        <div className="flex min-w-0 flex-1 justify-center lg:flex-none lg:justify-start">
          <Logo />
        </div>

        <NavbarMenu />

        <div className="flex shrink-0 items-center gap-3 lg:ml-auto">
          <UserMenu onLogout={handleLogout} />
          <div className="w-11 lg:hidden" aria-hidden />
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-zks-gold-mid/40 to-transparent" />
    </motion.header>
  );
}
