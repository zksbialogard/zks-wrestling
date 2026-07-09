import ParentLayoutClient from "@/components/parent/ParentLayoutClient";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Panel rodzica",
  path: "/panel-rodzica",
  noIndex: true,
});

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <ParentLayoutClient>{children}</ParentLayoutClient>;
}
