"use client";

import { motion } from "framer-motion";
import { Calendar, Medal, Trophy, Users } from "lucide-react";

const stats = [
  {
    value: "1500+",
    title: "Medali od początku klubu",
    icon: Trophy,
  },
  {
    value: "100+",
    title: "Aktywnych zawodników",
    icon: Users,
  },
  {
    value: "2020",
    title: "Rok założenia",
    icon: Calendar,
  },
  {
    value: "6",
    title: "Lat rozwoju",
    icon: Medal,
  },
];

export default function HeroStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="zks-card flex items-center gap-4 p-5 transition-transform"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-zks-gold-mid/30 bg-zks-gold/10 shadow-gold-glow-sm">
              <Icon className="h-6 w-6 text-zks-gold-bright" />
            </div>

            <div>
              <div className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zks-gold-bright">
                {item.value}
              </div>
              <div className="text-sm text-zks-text-muted">{item.title}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
