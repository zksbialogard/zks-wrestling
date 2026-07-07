"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
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
import {
  type BeforeInstallPromptEvent,
  detectInstallPlatform,
  isStandalonePwa,
} from "@/lib/pwa-install-utils";

const BENEFITS = [
  { icon: CalendarClock, text: "Treningi, zawody i przypomnienia pod ręką" },
  { icon: BellRing, text: "Powiadomienia push od klubu" },
  { icon: ClipboardList, text: "Panel rodzica i zawodnika w jednej aplikacji" },
  { icon: Newspaper, text: "Aktualności i galeria bez logowania do przeglądarki" },
];

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
    <li className="zks-card flex gap-4 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zks-gold-mid/40 bg-zks-gold/10 font-[family-name:var(--font-heading)] text-sm font-bold text-zks-gold-bright">
        {step}
      </span>
      <div className="min-w-0">
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
        Przewiń listę w dół i wybierz <strong className="text-zks-text">„Dodaj do ekranu początkowego”</strong>.
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

function AndroidInstructions({ canInstall, onInstall, installing }: {
  canInstall: boolean;
  onInstall: () => void;
  installing: boolean;
}) {
  return (
    <div className="space-y-4">
      {canInstall ? (
        <button
          type="button"
          onClick={onInstall}
          disabled={installing}
          className="zks-btn-primary inline-flex w-full items-center justify-center gap-2 py-3 text-sm disabled:opacity-60 sm:w-auto sm:px-8"
        >
          <Download className="h-4 w-4" />
          {installing ? "Instalowanie..." : "Zainstaluj aplikację"}
        </button>
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
  return (
    <div className="space-y-4">
      <div className="zks-card flex items-start gap-4 p-5">
        <Smartphone className="mt-0.5 h-8 w-8 shrink-0 text-zks-gold-bright" />
        <div>
          <h3 className="font-semibold text-white">Otwórz tę stronę na telefonie</h3>
          <p className="mt-2 text-sm leading-relaxed text-zks-text-muted">
            Instalacja działa na smartfonie. Wejdź na telefonie na adres{" "}
            <strong className="text-zks-text">zks-wrestling.vercel.app/pobierz</strong> albo
            zeskanuj kod QR ze strony klubu.
          </p>
          <p className="mt-3 text-sm text-zks-text-muted">
            W Chrome na komputerze też możesz kliknąć ikonę instalacji obok paska adresu (jeśli
            przeglądarka ją pokaże).
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DownloadAppClient() {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setPlatform(detectInstallPlatform());
    setInstalled(isStandalonePwa());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }

    setInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstalled(true);
      }

      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <main className="app-page">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-zks-gold-mid/30 bg-zks-gold/10 p-3">
            <ClubLogo size={64} glow priority />
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-heading)] text-4xl font-bold uppercase sm:text-5xl">
            Pobierz aplikację
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zks-text-muted sm:text-base">
            ZKS Białogard Manager — oficjalna aplikacja klubowa. Instalacja jest darmowa, bez
            Google Play i App Store. Wystarczy dodać stronę na ekran główny telefonu.
          </p>
        </div>

        {installed ? (
          <div className="zks-card mt-10 border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
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
          <>
            <section className="mt-10">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-zks-gold-mid">
                {platform === "ios"
                  ? "Instrukcja — iPhone"
                  : platform === "android"
                    ? "Instrukcja — Android"
                    : "Instrukcja — komputer"}
              </h2>

              <div className="mt-4">
                {platform === "ios" ? (
                  <IosInstructions />
                ) : platform === "android" ? (
                  <AndroidInstructions
                    canInstall={Boolean(deferredPrompt)}
                    onInstall={install}
                    installing={installing}
                  />
                ) : (
                  <DesktopInstructions />
                )}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-zks-gold-mid">
                Co zyskujesz
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {BENEFITS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li
                      key={item.text}
                      className="zks-card flex items-start gap-3 p-4 text-sm text-zks-text"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-zks-gold-bright" />
                      {item.text}
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        <section className="zks-card mt-10 p-5 text-sm text-zks-text-muted">
          <p>
            <strong className="text-zks-text">Masz problem?</strong> Na iPhone używaj Safari. Po
            instalacji otwórz aplikację z ikony na pulpicie, a nie z zakładki przeglądarki.
          </p>
          <p className="mt-3">
            <Link href="/kontakt" className="inline-flex items-center gap-1 text-zks-gold-bright hover:underline">
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
