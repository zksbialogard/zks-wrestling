"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
