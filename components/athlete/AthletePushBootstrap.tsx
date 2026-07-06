"use client";

import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ensureWebPushSubscription } from "@/lib/push-client";

export default function AthletePushBootstrap() {
  const { user, ready, loadingProfile } = useAuth();

  useEffect(() => {
    if (!ready || loadingProfile || !user) {
      return;
    }

    void ensureWebPushSubscription();
  }, [ready, loadingProfile, user]);

  return null;
}
