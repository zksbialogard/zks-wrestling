import DownloadAppClient from "@/components/pwa/DownloadAppClient";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Pobierz aplikację",
  description:
    "Zainstaluj oficjalną aplikację ZKS Białogard na Androidzie lub iPhone — powiadomienia, zawody i panel rodzica.",
  path: "/pobierz",
});

export default function PobierzPage() {
  return <DownloadAppClient />;
}
