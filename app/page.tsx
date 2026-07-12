import Hero from "@/components/hero/Hero";
import About from "@/components/home/About";
import WhyUs from "@/components/home/WhyUs";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import News from "@/components/home/News";
import Contact from "@/components/home/Contact";
import Footer from "@/components/home/Footer";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { dedupeEventsByDateAndTitle, isUpcomingEvent } from "@/lib/event-calendar-utils";
import { getEvents } from "@/lib/events-server";
import { getNews } from "@/lib/news";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "ZKS Białogard — klub zapaśniczy, zawody i treningi",
  description:
    "ZKS Białogard — zapasy dla dzieci i młodzieży. Aktualności klubu, nadchodzące zawody, zapisy i panel rodzica w oficjalnej aplikacji.",
  path: "/",
});

export const dynamic = "force-dynamic";

async function getAktualnosci() {
  return getNews({ fresh: true });
}

async function getUpcomingEvents() {
  const events = await getEvents();

  return dedupeEventsByDateAndTitle(events)
    .filter((event) => isUpcomingEvent(event))
    .slice(0, 4);
}

export default async function Home() {
  const aktualnosci = await getAktualnosci();
  const events = await getUpcomingEvents();

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <OrganizationJsonLd />
      <Hero />

      <About />

      <WhyUs />

      <News aktualnosci={aktualnosci} />

      <UpcomingEvents events={events} />

      <Contact />

      <Footer />
    </main>
  );
}
