"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ParentHeader from "@/components/parent/ParentHeader";
import ParentNav from "@/components/parent/ParentNav";
import ParentPushBootstrap from "@/components/parent/ParentPushBootstrap";
import PushPrompt from "@/components/parent/PushPrompt";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-zks-black pb-24 text-white lg:pb-0">
        <ParentPushBootstrap />
        <ParentHeader />

        <div className="mx-auto flex max-w-7xl">
          <ParentNav />
          <section className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <PushPrompt />
            {children}
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
