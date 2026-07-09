"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { PanelAlerts, PanelMain } from "@/components/layout/PanelLayout";
import ParentHeader from "@/components/parent/ParentHeader";
import ParentNav from "@/components/parent/ParentNav";
import ParentPushBootstrap from "@/components/parent/ParentPushBootstrap";
import PushPrompt from "@/components/parent/PushPrompt";
import TrainingGroupBanner from "@/components/parent/TrainingGroupBanner";

export default function ParentLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireRole="rodzic">
      <div className="panel-shell text-white">
        <ParentPushBootstrap />
        <ParentHeader />

        <div className="mx-auto flex max-w-7xl">
          <ParentNav />
          <PanelMain>
            <PanelAlerts>
              <PushPrompt role="rodzic" />
              <TrainingGroupBanner />
            </PanelAlerts>
            {children}
          </PanelMain>
        </div>
      </div>
    </AuthGuard>
  );
}
