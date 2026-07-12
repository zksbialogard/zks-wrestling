"use client";

import { motion } from "framer-motion";
import ClubLogo from "@/components/ui/ClubLogo";

export default function HeroShield() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.25 }}
      className="relative flex w-full items-center justify-center"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-40 w-40 rounded-full bg-zks-gold/10 blur-[52px] sm:h-52 sm:w-52 lg:h-64 lg:w-64" />
      </div>

      <motion.div
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[min(52vw,200px)] sm:w-[min(44vw,280px)] lg:w-[min(38vw,400px)]"
      >
        <ClubLogo glow priority fluid />
      </motion.div>
    </motion.div>
  );
}
