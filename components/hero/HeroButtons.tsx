"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Users } from "lucide-react";

export default function HeroButtons() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.6 }}
      className="flex flex-col items-center gap-4 sm:flex-row sm:items-center lg:justify-start"
    >
      <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link
          href="/rejestracja"
          className="zks-btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-sm"
        >
          <Users className="h-5 w-5" />
          Dołącz do ZKS
        </Link>
      </motion.div>

      <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link
          href="/kalendarz-imprez"
          className="zks-btn-outline inline-flex items-center justify-center gap-2 px-8 py-4 text-sm shadow-gold-glow-sm"
        >
          <CalendarDays className="h-5 w-5 text-zks-gold-mid" />
          Kalendarz imprez
        </Link>
      </motion.div>
    </motion.div>
  );
}
