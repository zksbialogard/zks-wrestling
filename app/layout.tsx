import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ZKS Białogard",
  description: "Klub Zapaśniczy ZKS Białogard",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
