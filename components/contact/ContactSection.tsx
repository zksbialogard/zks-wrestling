"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";

import ContactForm from "./ContactForm";
import ClubMap from "./ClubMap";
import {
  clubContact,
  contactChannels,
  contactIntro,
} from "./contact-content";

type ContactSectionProps = {
  variant?: "home" | "page";
};

export default function ContactSection({ variant = "page" }: ContactSectionProps) {
  const isPage = variant === "page";

  return (
    <section
      className={`relative w-full overflow-hidden ${
        isPage ? "pb-16 sm:pb-24" : "py-20 sm:py-24"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-zks-black via-zks-black-soft to-zks-black" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-zks-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-zks-gold-deep/10 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
        >
          <p className="zks-label">{contactIntro.label}</p>
          <h1
            className={`mt-4 font-[family-name:var(--font-heading)] font-bold uppercase leading-[1.1] text-white ${
              isPage ? "text-3xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-5xl"
            }`}
          >
            {contactIntro.title}{" "}
            <span className="text-gradient-gold">{contactIntro.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zks-text sm:text-lg">
            {contactIntro.lead}
          </p>
        </motion.header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {contactChannels.map((channel, index) => {
            const Icon = channel.icon;

            return (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="zks-card flex h-full flex-col p-5 sm:p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10">
                  <Icon className="h-5 w-5 text-zks-gold-bright" />
                </div>

                <h2 className="font-[family-name:var(--font-heading)] text-base font-bold uppercase text-white sm:text-lg">
                  {channel.title}
                </h2>

                <div className="mt-3 flex-1 space-y-1 text-sm leading-relaxed text-zks-text">
                  {channel.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                {channel.action && (
                  <a
                    href={channel.action.href}
                    target={channel.action.external ? "_blank" : undefined}
                    rel={channel.action.external ? "noopener noreferrer" : undefined}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zks-gold-bright transition hover:text-zks-gold-highlight"
                  >
                    {channel.action.label}
                    {channel.action.external && <ExternalLink className="h-3.5 w-3.5" />}
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>

        {isPage ? (
          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <ClubMap />

              <div className="zks-card p-6 sm:p-7">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
                  Dołącz do ZKS
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zks-text-muted sm:text-base">
                  Chcesz zapisać dziecko na treningi? Załóż konto rodzica w aplikacji
                  klubowej — to najszybsza droga do zgłoszeń i informacji o zawodach.
                </p>
                <Link
                  href="/rejestracja"
                  className="zks-btn-primary mt-5 inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm"
                >
                  Rejestracja online
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ContactForm />
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <a
              href={clubContact.phoneHref}
              className="zks-btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm"
            >
              Zadzwoń: {clubContact.phone}
            </a>
            <Link
              href="/kontakt"
              className="zks-btn-outline inline-flex items-center gap-2 px-8 py-3.5 text-sm"
            >
              Pełny kontakt
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
