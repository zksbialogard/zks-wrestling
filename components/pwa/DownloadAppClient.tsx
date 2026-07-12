"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  Newspaper,
  Share,
  Smartphone,
} from "lucide-react";

import Footer from "@/components/home/Footer";
import ClubLogo from "@/components/ui/ClubLogo";
import { usePwaInstall } from "@/components/pwa/PwaInstallProvider";
import { getSiteUrl } from "@/lib/site-config";

const BENEFITS = [
  { icon: CalendarClock, text: "Treningi, zawody i przypomnienia pod ręką" },
  { icon: BellRing, text: "Powiadomienia push od klubu" },
  { icon: ClipboardList, text: "Panel rodzica i zawodnika w jednej aplikacji" },
  { icon: Newspaper, text: "Aktualności i galeria bez logowania do przeglądarki" },
];

function PageSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`w-full ${className}`.trim()}>
      <h2 className="text-center font-[family-name:var(--font-heading)] text-base font-bold uppercase tracking-[0.12em] text-zks-gold-mid sm:text-lg">
        {title}
      </h2>
      <div className="mt-5 sm:mt-6">{children}</div>
    </section>
  );
}

function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="zks-card flex gap-4 p-4 sm:p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zks-gold-mid/40 bg-zks-gold/10 font-[family-name:var(--font-heading)] text-sm font-bold text-zks-gold-bright">
        {step}
      </span>
      <div className="min-w-0 text-left">
        <h3 className="font-semibold text-white">{title}</h3>
        <div className="mt-1 text-sm leading-relaxed text-zks-text-muted">{children}</div>
      </div>
    </li>
  );
}

function IosInstructions() {
  return (
    <ol className="space-y-3">
      <StepCard step={1} title="Otwórz Safari">
        Strona musi być w <strong className="text-zks-text">Safari</strong> — w Chrome na iPhone
        instalacja nie działa.
      </StepCard>
      <StepCard step={2} title="Kliknij Udostępnij">
        <span className="inline-flex items-center gap-2">
          Ikona
          <Share className="inline h-4 w-4 text-zks-gold-bright" />
          na dole ekranu (środek paska).
        </span>
      </StepCard>
      <StepCard step={3} title="Dodaj do ekranu początkowego">
        Przewiń listę w dół i wybierz{" "}
        <strong className="text-zks-text">„Dodaj do ekranu początkowego”</strong>.
      </StepCard>
      <StepCard step={4} title="Potwierdź">
        Kliknij <strong className="text-zks-text">Dodaj</strong> w prawym górnym rogu. Ikona ZKS
        pojawi się na pulpicie.
      </StepCard>
      <StepCard step={5} title="Uruchom z ikony">
        Otwieraj klub z nowej ikony — wtedy działają powiadomienia push i pełny ekran.
      </StepCard>
    </ol>
  );
}

function AndroidInstructions({
  canInstall,
  onInstall,
  installing,
}: {
  canInstall: boolean;
  onInstall: () => void;
  installing: boolean;
}) {
  return (
    <div className="space-y-5">
      {canInstall ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onInstall}
            disabled={installing}
            className="zks-btn-primary inline-flex w-full max-w-xs animate-pulse items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-60 sm:animate-none"
          >
            <Download className="h-4 w-4" />
            {installing ? "Instalowanie..." : "Zainstaluj aplikację"}
          </button>
        </div>
      ) : null}

      <ol className="space-y-3">
        {!canInstall ? (
          <StepCard step={1} title="Otwórz Chrome">
            Na Androidzie najlepiej użyć przeglądarki Chrome.
          </StepCard>
        ) : null}
        <StepCard step={canInstall ? 1 : 2} title="Menu przeglądarki">
          Kliknij trzy kropki <strong className="text-zks-text">⋮</strong> w prawym górnym rogu.
        </StepCard>
        <StepCard step={canInstall ? 2 : 3} title="Zainstaluj aplikację">
          Wybierz <strong className="text-zks-text">„Zainstaluj aplikację”</strong> lub{" "}
          <strong className="text-zks-text">„Dodaj do ekranu głównego”</strong>.
        </StepCard>
        <StepCard step={canInstall ? 3 : 4} title="Gotowe">
          Ikona ZKS Białogard pojawi się obok innych aplikacji.
        </StepCard>
      </ol>
    </div>
  );
}

function DesktopInstructions() {
  const siteUrl = getSiteUrl();

  return (
    <div className="zks-card mx-auto max-w-lg p-6 text-center sm:p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zks-gold-mid/30 bg-zks-gold/10">
        <Smartphone className="h-7 w-7 text-zks-gold-bright" />
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
        Otwórz na telefonie
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zks-text-muted">
        Instalacja działa na smartfonie. Wejdź na telefonie na adres{" "}
        <strong className="text-zks-text">{siteUrl.replace(/^https:\/\//, "")}/pobierz</strong>{" "}
        albo zeskanuj kod QR ze strony klubu.
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm text-zks-text-muted">
        Na komputerze kliknij ikonę instalacji obok paska adresu albo zakładkę{" "}
        <strong className="text-zks-text">Pobierz Aplikację</strong> w menu.
      </p>
    </div>
  );
}

export default function DownloadAppClient() {
  const { platform, isInstalled, canInstall, installing, promptInstall } = usePwaInstall();

  const instructionTitle =
    platform === "ios"
      ? "Instrukcja — iPhone"
      : platform === "android"
        ? "Instrukcja — Android"
        : "Instrukcja — komputer";

  return (
    <main className="app-page">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 sm:px-6">
        <div className="download-hero zks-card w-full max-w-2xl border-zks-gold-mid/25 p-6 text-center sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-zks-gold-mid/30 bg-zks-gold/10 p-3">
            <ClubLogo size={64} glow priority />
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-heading)] text-3xl font-bold uppercase sm:text-4xl lg:text-5xl">
            Pobierz aplikację
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zks-text-muted sm:text-base">
            ZKS Białogard Manager — oficjalna aplikacja klubowa. Instalacja jest darmowa, bez
            Google Play i App Store.
          </p>

          {!isInstalled && canInstall && platform !== "ios" ? (
            <button
              type="button"
              onClick={() => void promptInstall()}
              disabled={installing}
              className="zks-btn-primary mx-auto mt-8 inline-flex min-w-[14rem] items-center justify-center gap-2 px-8 py-3.5 text-sm disabled:opacity-60 sm:text-base"
            >
              <Download className="h-5 w-5" />
              {installing ? "Instalowanie..." : "Zainstaluj teraz"}
            </button>
          ) : null}
        </div>

        {isInstalled ? (
          <div className="zks-card mt-10 w-full max-w-2xl border-emerald-500/30 bg-emerald-500/5 p-6 text-center sm:mt-12 sm:p-8">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
            <h2 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
              Aplikacja zainstalowana
            </h2>
            <p className="mt-2 text-sm text-zks-text-muted">
              Uruchamiasz ją z ikony na pulpicie. Możesz przejść do panelu lub włączyć
              powiadomienia.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/login" className="zks-btn-primary px-6 py-2.5 text-sm">
                Zaloguj się
              </Link>
              <Link
                href="/panel-rodzica/powiadomienia"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zks-gold-mid/40 px-6 py-2.5 text-sm text-zks-gold-bright transition hover:bg-zks-gold/10"
              >
                <BellRing className="h-4 w-4" />
                Powiadomienia
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 flex w-full max-w-2xl flex-col gap-10 sm:mt-12 sm:gap-12">
            <PageSection title={instructionTitle}>
              <div className="mx-auto w-full">
                {platform === "ios" ? (
                  <IosInstructions />
                ) : platform === "android" ? (
                  <AndroidInstructions
                    canInstall={canInstall}
                    onInstall={() => void promptInstall()}
                    installing={installing}
                  />
                ) : (
                  <DesktopInstructions />
                )}
              </div>
            </PageSection>

            <PageSection title="Co zyskujesz">
              <div className="flex justify-center">
                <ul className="grid w-full max-w-2xl gap-3 sm:grid-cols-2 sm:gap-4">
                  {BENEFITS.map((item) => {
                    const Icon = item.icon;

                    return (
                      <li
                        key={item.text}
                        className="zks-card flex items-start gap-3 p-4 text-left text-sm text-zks-text sm:p-5"
                      >
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-zks-gold-bright" />
                        {item.text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </PageSection>
          </div>
        )}

        <section className="zks-card mt-10 w-full max-w-xl p-5 text-center text-sm text-zks-text-muted sm:mt-12 sm:p-6">
          <p>
            <strong className="text-zks-text">Masz problem?</strong> Na iPhone używaj Safari. Po
            instalacji otwórz aplikację z ikony na pulpicie, a nie z zakładki przeglądarki.
          </p>
          <p className="mt-3">
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-1 text-zks-gold-bright hover:underline"
            >
              Kontakt z klubem
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
