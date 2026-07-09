import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Wyniki zawodów",
  description: "Wyniki zawodów zawodników ZKS Białogard — miejsca, kategorie wagowe i podsumowania.",
  path: "/zawody/wyniki-zawodow",
});

export default function WynikiZawodowLayout({ children }: { children: React.ReactNode }) {
  return children;
}
