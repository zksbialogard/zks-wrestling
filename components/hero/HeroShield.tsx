"use client";

import { motion } from "framer-motion";
import ClubLogo from "@/components/ui/ClubLogo";

export default function HeroShield() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.25 }}
      className="relative flex w-full items-center justify-center lg:justify-end"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center lg:justify-end">
        <div className="h-48 w-48 rounded-full bg-zks-gold/15 blur-[70px] sm:h-64 sm:w-64 lg:h-80 lg:w-80" />
      </div>

      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[min(58vw,220px)] sm:w-[min(50vw,320px)] lg:w-[min(42vw,460px)]"
      >
        <ClubLogo glow priority fluid />
      </motion.div>
    </motion.div>
  );
}
