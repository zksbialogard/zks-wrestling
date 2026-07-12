import ModeratorLayoutClient from "@/components/moderator/ModeratorLayoutClient";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Panel moderatora",
  path: "/moderator",
  noIndex: true,
});

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return <ModeratorLayoutClient>{children}</ModeratorLayoutClient>;
}
