"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  subtitle,
}: Props) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
      relative
      overflow-hidden
      rounded-3xl
      border
      border-yellow-500/20
      bg-zinc-900/80
      p-7
      shadow-xl
      backdrop-blur-xl
      "
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-sm uppercase tracking-widest text-zinc-400">
            {title}
          </p>

          <h2 className="mt-3 text-5xl font-black text-white">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-zinc-500">
              {subtitle}
            </p>
          )}

        </div>

        <div className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-2xl
        bg-yellow-500
        text-black
        shadow-lg
        ">
          {icon}
        </div>

      </div>
    </motion.div>
  );
}