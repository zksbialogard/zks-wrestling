"use client";

import { useEffect } from "react";

import { ensureWebPushSubscription } from "@/lib/push-client";

/** Po zalogowaniu rodzica automatycznie rejestruje push w Supabase (jeśli zgoda już jest). */
export default function ParentPushBootstrap() {
  useEffect(() => {
    void ensureWebPushSubscription();
  }, []);

  return null;
}
