"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ClubLogo from "@/components/ui/ClubLogo";

export default function Logo() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-3 select-none">
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.25 }}>
        <ClubLogo size={48} glow priority className="lg:hidden" />
        <ClubLogo size={52} glow priority className="hidden lg:block" />
      </motion.div>

      <div className="hidden flex-col leading-none sm:flex">
        <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-wider text-white transition group-hover:text-zks-gold-bright lg:text-2xl">
          ZKS
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-zks-gold-mid lg:text-xs">
          Białogard
        </span>
      </div>
    </Link>
  );
}
