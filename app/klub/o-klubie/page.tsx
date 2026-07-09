import AboutClubSection from "@/components/club/AboutClubSection";
import Footer from "@/components/home/Footer";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "O klubie",
  description:
    "Poznaj ZKS Białogard — historia klubu, treningi zapaśnicze dla dzieci i młodzieży, misja i wartości.",
  path: "/klub/o-klubie",
});

export default function OKlubiePage() {
  return (
    <main className="app-page">
      <AboutClubSection variant="page" />
      <Footer />
    </main>
  );
}
