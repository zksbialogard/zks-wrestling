import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Rejestracja",
  path: "/rejestracja",
  noIndex: true,
});

export default function RejestracjaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
