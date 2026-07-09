"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAdmin>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
