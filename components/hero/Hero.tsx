"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import HeroShield from "./HeroShield";
import HeroStats from "./HeroStats";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-zks-black">
      <HeroBackground />

      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
          <HeroContent />
          <HeroShield />
        </div>

        <div className="mt-12 lg:mt-16">
          <HeroStats />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-col items-center gap-1 text-zks-text-muted"
        >
          <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.3em]">
            Przewiń
          </span>
          <ChevronDown className="h-5 w-5 animate-bounce text-zks-gold-mid" />
        </motion.div>
      </div>
    </section>
  );
}
