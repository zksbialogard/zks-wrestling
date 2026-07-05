import AboutClubSection from "@/components/club/AboutClubSection";
import Footer from "@/components/home/Footer";

export default function OKlubiePage() {
  return (
    <main className="min-h-screen bg-zks-black pt-28 text-white sm:pt-32 lg:pt-36">
      <AboutClubSection variant="page" />
      <Footer />
    </main>
  );
}
