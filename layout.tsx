import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="pl" className={cn("font-sans", geist.variable)}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
