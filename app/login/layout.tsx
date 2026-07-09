import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Logowanie",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
