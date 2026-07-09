import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Panel administratora",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
