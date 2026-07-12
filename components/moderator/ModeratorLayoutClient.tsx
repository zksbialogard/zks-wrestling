"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ModeratorShell from "@/components/moderator/ModeratorShell";

export default function ModeratorLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireModerator>
      <ModeratorShell>{children}</ModeratorShell>
    </AuthGuard>
  );
}
