import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Zawody",
  description:
    "Kalendarz zawodów ZKS Białogard — terminy, miejsca, zapisy online dla zawodników klubu.",
  path: "/zawody",
});

export default function ZawodyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
