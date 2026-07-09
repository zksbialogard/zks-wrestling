"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import AthleteHeader from "@/components/athlete/AthleteHeader";
import AthleteNav from "@/components/athlete/AthleteNav";
import AthletePushBootstrap from "@/components/athlete/AthletePushBootstrap";
import { PanelAlerts, PanelMain } from "@/components/layout/PanelLayout";
import PushPrompt from "@/components/parent/PushPrompt";

export default function AthleteLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireRole="zawodnik">
      <div className="panel-shell text-white">
        <AthletePushBootstrap />
        <AthleteHeader />

        <div className="mx-auto flex max-w-7xl">
          <AthleteNav />
          <PanelMain>
            <PanelAlerts>
              <PushPrompt role="zawodnik" />
            </PanelAlerts>
            {children}
          </PanelMain>
        </div>
      </div>
    </AuthGuard>
  );
}
