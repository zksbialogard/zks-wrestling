export const dynamic = "force-dynamic";

import EventsSectionHero from "@/components/events/EventsSectionHero";
import CompetitionResultsList from "@/components/events/CompetitionResultsList";
import {
  FACEBOOK_CLUB_PAGE_URL,
  FACEBOOK_RESULTS_YEAR,
  listPublicFacebookResults,
} from "@/lib/facebook-results-sync";

export default async function WynikiZawodowPage() {
  const results = await listPublicFacebookResults(FACEBOOK_RESULTS_YEAR);

  return (
    <main className="app-page relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-zks-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-zks-gold-deep/10 blur-[140px]" />

      <section className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <EventsSectionHero
          label="Osiągnięcia klubu"
          title="Wyniki"
          titleAccent="zawodów"
          description={`Starty i miejsca zawodników ZKS Białogard w sezonie ${FACEBOOK_RESULTS_YEAR}. Dane aktualizowane automatycznie z profilu klubu na Facebooku.`}
        />

        <CompetitionResultsList events={results} year={FACEBOOK_RESULTS_YEAR} />

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-zks-text-muted">
          Źródło wyników:{" "}
          <a
            href={FACEBOOK_CLUB_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zks-gold-bright underline-offset-2 hover:underline"
          >
            facebook.com/zksbialogard
          </a>
        </p>
      </section>
    </main>
  );
}
