"use client";

import { useRouter } from "next/navigation";

import ModeratorBottomNav from "@/components/moderator/ModeratorBottomNav";
import ModeratorSidebar from "@/components/moderator/ModeratorSidebar";
import ModeratorTopbar from "@/components/moderator/ModeratorTopbar";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ModeratorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="admin-shell flex min-h-screen bg-zks-black">
      <ModeratorSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <ModeratorTopbar onLogout={handleLogout} />
        <main className="panel-admin-main">
          <div className="panel-page mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <ModeratorBottomNav onLogout={handleLogout} />
    </div>
  );
}
