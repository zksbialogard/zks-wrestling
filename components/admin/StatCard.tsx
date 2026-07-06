"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="zks-card zks-card-pad"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zks-text-muted">{title}</p>
          <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-zks-gold-bright">
            {value}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-zks-text-muted">{subtitle}</p>
          )}
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10 text-zks-gold-bright shadow-gold-glow-sm">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
