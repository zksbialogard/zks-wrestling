"use client";



import Link from "next/link";

import { motion } from "framer-motion";

import { ArrowRight, ChevronRight } from "lucide-react";



import ClubLogo from "@/components/ui/ClubLogo";

import {

  aboutHighlights,

  aboutIntro,

  aboutParagraphs,

  aboutTimeline,
  clubDiscipline,
} from "./about-content";



type AboutClubSectionProps = {

  variant?: "home" | "page";

};



export default function AboutClubSection({ variant = "home" }: AboutClubSectionProps) {

  const isPage = variant === "page";



  return (

    <section

      className={`relative w-full overflow-hidden ${

        isPage ? "pb-16 sm:pb-24" : "py-20 sm:py-28"

      }`}

    >

      <div className="absolute inset-0 bg-gradient-to-b from-zks-black via-zks-black-soft to-zks-black" />

      <div className="pointer-events-none absolute -left-32 top-32 h-80 w-80 rounded-full bg-zks-gold/10 blur-[120px]" />

      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-zks-gold-deep/10 blur-[140px]" />



      <div

        className={`relative mx-auto w-full ${

          isPage ? "max-w-6xl px-5 sm:px-8" : "max-w-7xl px-5 sm:px-6 lg:px-8"

        }`}

      >

        {/* Nagłówek sekcji */}

        <motion.header

          initial={{ opacity: 0, y: 20 }}

          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true }}

          transition={{ duration: 0.5 }}

          className={`${isPage ? "mb-12 sm:mb-16" : "mb-10 sm:mb-14"} mx-auto max-w-3xl text-center`}
        >
          <p className="zks-label">{aboutIntro.label}</p>

          <div className="flex justify-center">
            <DisciplineBadge className="mt-4" />
          </div>

          <h2
            className={`mt-4 font-[family-name:var(--font-heading)] font-bold uppercase leading-[1.1] text-white ${
              isPage ? "text-3xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-5xl"
            }`}
          >
            {aboutIntro.title}{" "}
            <span className="text-gradient-gold">{aboutIntro.titleAccent}</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zks-text sm:text-lg">
            {aboutIntro.lead}
          </p>

        </motion.header>



        {/* Karta klubu — na mobile nad tekstem, żeby nie nachodziła na tytuł */}

        <motion.div

          initial={{ opacity: 0, y: 24 }}

          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true }}

          transition={{ duration: 0.5, delay: 0.05 }}

          className="mb-10 lg:hidden"

        >

          <ClubIdentityCard />

        </motion.div>



        {/* Treść główna */}

        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 xl:gap-16">

          <motion.div

            initial={{ opacity: 0, y: 24 }}

            whileInView={{ opacity: 1, y: 0 }}

            viewport={{ once: true }}

            transition={{ duration: 0.5, delay: 0.1 }}

            className="space-y-6 sm:space-y-7"

          >

            <div className="space-y-5 sm:space-y-6">

              {aboutParagraphs.map((paragraph, index) => (

                <p

                  key={index}

                  className="max-w-2xl text-[15px] leading-7 text-zks-text sm:text-base sm:leading-8"

                >

                  {paragraph}

                </p>

              ))}

            </div>



            <div className="zks-card relative overflow-hidden p-5 sm:p-7">

              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-zks-gold-bright via-zks-gold to-zks-gold-deep" />

              <p className="pl-4 font-[family-name:var(--font-heading)] text-base font-medium uppercase leading-snug tracking-wide text-zks-gold-bright sm:text-lg">

                „Charakter • Walka • Ciężka Praca”

              </p>

              <p className="mt-3 pl-4 text-sm leading-relaxed text-zks-text-muted sm:text-base sm:leading-7">

                To nie tylko hasło klubu — to codzienna praca na sali treningowej i

                wartości, które zostają z zawodnikami na całe życie.

              </p>

            </div>

          </motion.div>



          <motion.div

            initial={{ opacity: 0, y: 24 }}

            whileInView={{ opacity: 1, y: 0 }}

            viewport={{ once: true }}

            transition={{ duration: 0.5, delay: 0.15 }}

            className="hidden lg:block"

          >

            <ClubIdentityCard />

          </motion.div>

        </div>



        {/* Karty wartości */}

        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">

          {aboutHighlights.map((item, index) => {

            const Icon = item.icon;



            return (

              <motion.div

                key={item.title}

                initial={{ opacity: 0, y: 24 }}

                whileInView={{ opacity: 1, y: 0 }}

                viewport={{ once: true }}

                transition={{ delay: index * 0.08, duration: 0.45 }}

                whileHover={{ y: -4 }}

                className="zks-card group p-5 sm:p-6 transition-transform"

              >

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10 transition group-hover:shadow-gold-glow-sm sm:mb-5 sm:h-12 sm:w-12">

                  <Icon className="h-5 w-5 text-zks-gold-bright sm:h-6 sm:w-6" />

                </div>

                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white sm:text-xl">

                  {item.title}

                </h3>

                <p className="mt-2 text-sm leading-relaxed text-zks-text-muted sm:mt-3 sm:text-base">

                  {item.text}

                </p>

              </motion.div>

            );

          })}

        </div>



        {/* Oś czasu — tylko pełna strona */}

        {isPage && (

          <motion.div

            initial={{ opacity: 0, y: 24 }}

            whileInView={{ opacity: 1, y: 0 }}

            viewport={{ once: true }}

            transition={{ duration: 0.5 }}

            className="mt-16 sm:mt-20"

          >

            <div className="mb-10 text-left sm:mb-12">

              <p className="zks-label">Historia</p>

              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-4xl">

                Nasza <span className="text-gradient-gold">droga</span>

              </h3>

            </div>



            <div className="relative max-w-3xl">

              <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-zks-gold-bright via-zks-gold-mid/60 to-transparent sm:left-4" />



              <div className="space-y-6 sm:space-y-8">

                {aboutTimeline.map((item, index) => (

                  <motion.div

                    key={item.year}

                    initial={{ opacity: 0, y: 16 }}

                    whileInView={{ opacity: 1, y: 0 }}

                    viewport={{ once: true }}

                    transition={{ delay: index * 0.06 }}

                    className="relative pl-8 sm:pl-12"

                  >

                    <div className="absolute left-0 top-5 h-3.5 w-3.5 rounded-full border-2 border-zks-gold-bright bg-zks-black sm:left-2.5" />

                    <div className="zks-card p-5 sm:p-6">

                      <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-[0.2em] text-zks-gold-mid sm:text-sm">

                        {item.year}

                      </p>

                      <h4 className="mt-2 font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white sm:text-xl">

                        {item.title}

                      </h4>

                      <p className="mt-2 text-sm leading-relaxed text-zks-text-muted sm:text-base">

                        {item.text}

                      </p>

                    </div>

                  </motion.div>

                ))}

              </div>

            </div>

          </motion.div>

        )}



        {/* CTA */}

        <motion.div

          initial={{ opacity: 0, y: 16 }}

          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true }}

          transition={{ duration: 0.45 }}

          className={`mt-14 flex flex-col gap-3 sm:mt-16 sm:flex-row sm:flex-wrap ${

            isPage ? "justify-start" : "items-center justify-center"

          }`}

        >

          <Link

            href="/rejestracja"

            className="zks-btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:px-8"

          >

            Dołącz do klubu

            <ArrowRight className="h-4 w-4" />

          </Link>



          {!isPage ? (

            <Link

              href="/klub/o-klubie"

              className="zks-btn-outline inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:px-8"

            >

              Więcej o klubie

              <ChevronRight className="h-4 w-4" />

            </Link>

          ) : (

            <>

              <Link

                href="/galeria"

                className="zks-btn-outline inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:px-8"

              >

                Galeria

              </Link>

              <Link

                href="/kontakt"

                className="zks-btn-outline inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:px-8"

              >

                Kontakt

              </Link>

            </>

          )}

        </motion.div>

      </div>

    </section>

  );

}



function DisciplineBadge({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex rounded-full border border-zks-gold-mid/50 bg-zks-gold/15 px-4 py-2 font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-[0.12em] text-zks-gold-bright shadow-gold-glow-sm sm:px-5 sm:py-2.5 sm:text-sm ${className}`}
    >
      {clubDiscipline}
    </p>
  );
}

function ClubIdentityCard() {
  return (
    <div className="zks-card relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-zks-gold/15 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <DisciplineBadge className="mb-5 sm:mb-6" />

        <div className="-translate-y-2 mb-3 sm:-translate-y-3 sm:mb-4">
          <ClubLogo size={96} glow className="mx-auto sm:hidden" />
          <ClubLogo size={112} glow className="mx-auto hidden sm:block" />
        </div>

        <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white sm:text-2xl">
          ZKS Białogard
        </h3>

        <p className="mt-2 text-xs text-zks-text-muted sm:text-sm">

          Grunwaldzka 46 · 78-200 Białogard

        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8">
          {["Treningi", "Zawody", "Rodzina"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zks-gold-mid/25 bg-zks-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-zks-gold-mid sm:text-[11px]"
            >
              {tag}
            </span>
          ))}
        </div>

      </div>

    </div>

  );

}


