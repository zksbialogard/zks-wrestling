import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import LogoFilters from "@/components/ui/LogoFilters";
import AppProviders from "@/components/providers/AppProviders";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import PwaUpdatePrompt from "@/components/pwa/PwaUpdatePrompt";
import { Oswald, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { createRootMetadata } from "@/lib/site-config";

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export const metadata = createRootMetadata();

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      className={cn("dark font-sans", oswald.variable, inter.variable)}
    >
      <body>
        <AppProviders>
          <LogoFilters />
          <Navbar />

          {children}

          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3500}
            theme="dark"
          />

          <InstallPrompt />
          <PwaUpdatePrompt />
        </AppProviders>
      </body>
    </html>
  );
}
