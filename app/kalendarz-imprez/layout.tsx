import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Kalendarz imprez",
  description:
    "Terminarz zawodów i turniejów ZKS Białogard — daty, miejsca i automatyczne przypomnienia przed startem.",
  path: "/kalendarz-imprez",
});

export default function KalendarzImprezLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
