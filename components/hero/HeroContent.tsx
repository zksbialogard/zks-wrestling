"use client";

import { motion } from "framer-motion";

import HeroButtons from "./HeroButtons";

export default function HeroContent() {
  return (
    <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
      <motion.p
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="zks-label"
      >
        Zapaśniczy Klub Sportowy
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mt-6 font-[family-name:var(--font-heading)] text-6xl font-bold leading-none text-gradient-gold sm:text-7xl lg:text-8xl"
      >
        ZKS
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.7 }}
        className="font-[family-name:var(--font-heading)] text-5xl font-bold leading-none text-white sm:text-6xl lg:text-7xl"
      >
        BIAŁOGARD
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-5 font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-[0.2em] text-zks-text sm:text-base"
      >
        <span className="text-zks-gold-mid">Charakter</span>
        <span className="mx-2 text-zks-gold-deep">•</span>
        <span className="text-zks-gold-mid">Walka</span>
        <span className="mx-2 text-zks-gold-deep">•</span>
        <span className="text-zks-gold-mid">Ciężka Praca</span>
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 max-w-xl text-base leading-relaxed text-zks-text sm:text-lg lg:mx-0 mx-auto"
      >
        Klub zapaśniczy z tradycjami. Szkolimy dzieci, młodzież i seniorów.
        Tworzymy zawodników gotowych do walki nie tylko na macie, ale również
        w codziennym życiu.
      </motion.p>

      <div className="mt-10">
        <HeroButtons />
      </div>
    </div>
  );
}
