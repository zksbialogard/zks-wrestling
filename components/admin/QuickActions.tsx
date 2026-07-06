"use client";

import Link from "next/link";
import {
  CalendarPlus,
  ChevronRight,
  Image as ImageIcon,
  Newspaper,
  UserPlus,
} from "lucide-react";

const actions = [
  {
    title: "Dodaj zawody",
    description: "Utwórz nowe zawody i rozpocznij zapisy.",
    href: "/admin/zawody",
    icon: CalendarPlus,
  },
  {
    title: "Dodaj aktualność",
    description: "Opublikuj informację dla rodziców.",
    href: "/admin/aktualnosci",
    icon: Newspaper,
  },
  {
    title: "Dodaj zdjęcia",
    description: "Uzupełnij galerię klubową.",
    href: "/admin/galeria",
    icon: ImageIcon,
  },
  {
    title: "Dodaj zawodnika",
    description: "Dodaj nowe dziecko do bazy klubu.",
    href: "/admin/zawodnicy",
    icon: UserPlus,
  },
];

export default function QuickActions() {
  return (
    <section className="zks-card zks-card-pad">
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
          Szybkie akcje
        </h2>
        <p className="mt-2 text-sm text-zks-text-muted">
          Najczęściej wykonywane operacje administracyjne.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-xl border border-zks-gold-mid/15 bg-zks-black p-5 transition hover:-translate-y-1 hover:border-zks-gold-mid/40 hover:shadow-gold-glow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-gold text-zks-black">
                  <Icon className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-zks-text-muted transition group-hover:translate-x-1 group-hover:text-zks-gold-bright" />
              </div>

              <h3 className="mt-5 font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
                {action.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zks-text-muted">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
