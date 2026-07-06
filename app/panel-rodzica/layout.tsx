"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ParentHeader from "@/components/parent/ParentHeader";
import ParentNav from "@/components/parent/ParentNav";
import ParentPushBootstrap from "@/components/parent/ParentPushBootstrap";
import PushPrompt from "@/components/parent/PushPrompt";
import TrainingGroupBanner from "@/components/parent/TrainingGroupBanner";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireRole="rodzic">
      <div className="min-h-screen overflow-x-hidden bg-zks-black pb-24 text-white lg:pb-0">
        <ParentPushBootstrap />
        <ParentHeader />

        <div className="mx-auto flex max-w-7xl">
          <ParentNav />
          <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <PushPrompt />
            <TrainingGroupBanner />
            {children}
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
