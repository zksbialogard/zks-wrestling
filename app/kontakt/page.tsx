import ContactSection from "@/components/contact/ContactSection";
import Footer from "@/components/home/Footer";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Kontakt",
  description:
    "Skontaktuj się z ZKS Białogard — adres klubu, telefon, e-mail i formularz kontaktowy dla rodziców i zawodników.",
  path: "/kontakt",
});

export default function KontaktPage() {
  return (
    <main className="app-page">
      <ContactSection variant="page" />
      <Footer />
    </main>
  );
}
