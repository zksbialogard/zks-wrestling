import AthleteLayoutClient from "@/components/athlete/AthleteLayoutClient";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Panel zawodnika",
  path: "/panel-zawodnika",
  noIndex: true,
});

export default function AthleteLayout({ children }: { children: React.ReactNode }) {
  return <AthleteLayoutClient>{children}</AthleteLayoutClient>;
}
