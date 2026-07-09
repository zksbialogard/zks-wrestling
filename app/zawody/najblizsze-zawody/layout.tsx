import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Najbliższe zawody",
  description: "Nadchodzące zawody zapaśnicze ZKS Białogard — terminy, lokalizacje i zapisy.",
  path: "/zawody/najblizsze-zawody",
});

export default function NajblizszeZawodyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
