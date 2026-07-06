"use client";

import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ensureWebPushSubscription } from "@/lib/push-client";

/** Po zalogowaniu rodzica automatycznie rejestruje push w Supabase (jeśli zgoda już jest). */
export default function ParentPushBootstrap() {
  const { user, ready, loadingProfile } = useAuth();

  useEffect(() => {
    if (!ready || loadingProfile || !user) {
      return;
    }

    void ensureWebPushSubscription();
  }, [ready, loadingProfile, user]);

  return null;
}
