import ContactSection from "@/components/contact/ContactSection";
import Footer from "@/components/home/Footer";

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-zks-black pt-28 text-white sm:pt-32 lg:pt-36">
      <ContactSection variant="page" />
      <Footer />
    </main>
  );
}
