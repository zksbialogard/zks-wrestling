"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import AthleteHeader from "@/components/athlete/AthleteHeader";
import AthleteNav from "@/components/athlete/AthleteNav";
import AthletePushBootstrap from "@/components/athlete/AthletePushBootstrap";
import PushPrompt from "@/components/parent/PushPrompt";

export default function AthleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireRole="zawodnik">
      <div className="min-h-screen overflow-x-hidden bg-zks-black pb-24 text-white lg:pb-0">
        <AthletePushBootstrap />
        <AthleteHeader />

        <div className="mx-auto flex max-w-7xl">
          <AthleteNav />
          <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <PushPrompt role="zawodnik" />
            {children}
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
