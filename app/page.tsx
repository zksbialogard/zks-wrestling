import Hero from "@/components/hero/Hero";
import About from "@/components/home/About";
import WhyUs from "@/components/home/WhyUs";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import News from "@/components/home/News";
import Contact from "@/components/home/Contact";
import Footer from "@/components/home/Footer";
import { getEvents } from "@/lib/events-server";
import { getNews } from "@/lib/news";

export const dynamic = "force-dynamic";

async function getAktualnosci() {
  const news = await getNews({ fresh: true });
  return news.slice(0, 4);
}

async function getUpcomingEvents() {
  const events = await getEvents();
  return events.slice(0, 4);
}

export default async function Home() {
  const aktualnosci = await getAktualnosci();
  const events = await getUpcomingEvents();

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center">
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
