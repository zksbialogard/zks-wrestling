"use client";

import { motion } from "framer-motion";
import { Dumbbell, Shield, Trophy, Users } from "lucide-react";

const cards = [
  {
    icon: Shield,
    title: "Charakter",
    text: "Budujemy ludzi silnych psychicznie i fizycznie. Uczymy szacunku, dyscypliny oraz odpowiedzialności.",
  },
  {
    icon: Dumbbell,
    title: "Walka",
    text: "Każdy trening przybliża do sukcesu. Rozwijamy technikę, siłę, szybkość i wytrzymałość.",
  },
  {
    icon: Users,
    title: "Rodzina",
    text: "Tworzymy zespół, w którym każdy zawodnik może liczyć na wsparcie trenerów i kolegów.",
  },
  {
    icon: Trophy,
    title: "Sukces",
    text: "Setki medali, dziesiątki turniejów i nieustanny rozwój naszych zawodników.",
  },
];

export default function WhyUs() {
  return (
    <section className="home-why-section relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zks-black via-zks-black-soft to-zks-black" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[min(70vw,22rem)] w-[min(70vw,22rem)] -translate-x-1/2 rounded-full bg-zks-gold/10 blur-[120px]" />

      <div className="home-why-inner relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="home-why-header"
        >
          <p className="home-why-kicker">ZKS Białogard</p>
          <h2 className="home-why-title">
            Dlaczego <span className="text-gradient-gold">ZKS?</span>
          </h2>
          <p className="home-why-lead">
            Zapasy to nie tylko sport. To charakter, dyscyplina i ciężka praca. Każdy zawodnik
            rozwija się nie tylko na macie, ale również poza nią.
          </p>
        </motion.header>

        <div className="flex w-full justify-center">
          <div className="home-why-grid">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="home-why-card group"
              >
                <div className="home-why-card-icon">
                  <Icon className="h-6 w-6 text-zks-gold-bright sm:h-7 sm:w-7" />
                </div>
                <h3 className="home-why-card-title">{card.title}</h3>
                <p className="home-why-card-text">{card.text}</p>
              </motion.article>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
