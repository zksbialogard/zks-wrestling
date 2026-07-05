"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Dumbbell,
  Users,
  Trophy,
} from "lucide-react";

const cards = [
  {
    icon: Shield,
    title: "CHARAKTER",
    text: "Budujemy ludzi silnych psychicznie i fizycznie. Uczymy szacunku, dyscypliny oraz odpowiedzialności.",
  },
  {
    icon: Dumbbell,
    title: "WALKA",
    text: "Każdy trening przybliża do sukcesu. Rozwijamy technikę, siłę, szybkość i wytrzymałość.",
  },
  {
    icon: Users,
    title: "RODZINA",
    text: "Tworzymy zespół, w którym każdy zawodnik może liczyć na wsparcie trenerów i kolegów.",
  },
  {
    icon: Trophy,
    title: "SUKCES",
    text: "Setki medali, dziesiątki turniejów i nieustanny rozwój naszych zawodników.",
  },
];

export default function WhyUs() {
  return (
    <section className="relative py-28 px-6 overflow-hidden">

      {/* Tło */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

      <div className="absolute left-1/2 top-0 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[170px]" />

      <div className="relative max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
          className="text-center mb-20"
        >
          <p className="uppercase tracking-[8px] text-yellow-400 font-semibold">
            ZKS BIAŁOGARD
          </p>

          <h2 className="mt-4 text-5xl md:text-7xl font-black text-white">
            Dlaczego
            <span className="text-yellow-400"> ZKS?</span>
          </h2>

          <p className="mt-8 max-w-3xl mx-auto text-zinc-400 text-xl leading-8">
            Zapasy to nie tylko sport.
            To charakter, dyscyplina i ciężka praca.
            Każdy zawodnik rozwija się nie tylko na macie,
            ale również poza nią.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">

          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * .12,
                  duration: .6,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                className="group rounded-3xl border border-yellow-500/20 bg-zinc-900/70 backdrop-blur-xl p-8 transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_45px_rgba(255,200,0,.15)]"
              >
                <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 mb-8 transition-all group-hover:scale-110">

                  <Icon
                    size={38}
                    className="text-yellow-400"
                  />

                </div>

                <h3 className="text-3xl font-black text-white mb-4">
                  {card.title}
                </h3>

                <p className="text-zinc-400 text-lg leading-8">
                  {card.text}
                </p>

              </motion.div>
            );
          })}

        </div>

      </div>

    </section>
  );
}