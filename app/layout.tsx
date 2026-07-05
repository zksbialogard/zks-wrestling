import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import LogoFilters from "@/components/ui/LogoFilters";
import AppProviders from "@/components/providers/AppProviders";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { Oswald, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { APP_NAME } from "@/lib/design-tokens";

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export const metadata = {
  title: APP_NAME,
  description:
    "Oficjalna aplikacja klubowa ZKS Białogard — zawody, aktualności, panel rodzica i administratora.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ZKS Manager",
  },
  icons: {
    icon: [{ url: "/logo-shield.png", type: "image/png" }],
    apple: [{ url: "/logo-shield.png", type: "image/png" }],
  },
};

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
        </AppProviders>
      </body>
    </html>
  );
}
