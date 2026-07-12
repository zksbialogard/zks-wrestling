"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PwaInstallProvider>{children}</PwaInstallProvider>
    </AuthProvider>
  );
}
