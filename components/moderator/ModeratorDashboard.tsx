"use client";

import Link from "next/link";

import { MODERATOR_NAV_ITEMS } from "@/lib/moderator-nav";

export default function ModeratorDashboard() {
  const quickLinks = MODERATOR_NAV_ITEMS.filter((item) => item.id !== "dashboard");

  return (
    <>
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase text-white sm:text-4xl">
          Szybki dostęp
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zks-text-muted sm:text-base">
          Wybierz sekcję, w której chcesz dodać treść. Jako moderator masz też dostęp do
          panelu rodzica — dzieci, zgłoszenia i powiadomienia pozostają bez zmian.
        </p>
        <Link
          href="/panel-rodzica"
          className="zks-btn-outline mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          Mój Panel rodzica
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className="zks-card group flex flex-col gap-4 p-6 transition hover:border-zks-gold-mid/40 hover:shadow-gold-glow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold-mid/10 text-zks-gold-bright transition group-hover:scale-105">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm text-zks-text-muted">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
