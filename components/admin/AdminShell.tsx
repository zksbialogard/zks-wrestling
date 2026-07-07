"use client";

import { useRouter } from "next/navigation";

import AdminBottomNav from "@/components/admin/AdminBottomNav";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminShell({
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
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onLogout={handleLogout} />
        <main className="panel-admin-main">
          <div className="panel-page mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <AdminBottomNav onLogout={handleLogout} />
    </div>
  );
}
