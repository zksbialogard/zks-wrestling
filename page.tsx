import { supabase } from "@/lib/supabase";

import Hero from "@/components/hero/Hero";
import About from "@/components/home/About";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import News from "@/components/home/News";
import Contact from "@/components/home/Contact";
import Footer from "@/components/home/Footer";

async function getAktualnosci() {
  const { data, error } = await supabase
    .from("aktualnosci")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .limit(4);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export default async function Home() {
  const aktualnosci = await getAktualnosci();
  const events = await getEvents();

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center">
      <Hero />

      <About />

      <UpcomingEvents events={events} />

      <News aktualnosci={aktualnosci} />

      <Contact />

      <Footer />
    </main>
  );
}