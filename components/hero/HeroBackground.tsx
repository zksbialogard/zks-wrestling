"use client";

import { motion } from "framer-motion";

export default function HeroBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-zks-black" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 45%, rgba(212, 175, 55, 0.14) 0%, transparent 55%)",
        }}
      />

      <motion.div
        animate={{ opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -right-32 top-1/3 h-[600px] w-[600px] rounded-full bg-zks-gold/10 blur-[120px]"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-zks-black/20 via-transparent to-zks-black" />
    </>
  );
}
