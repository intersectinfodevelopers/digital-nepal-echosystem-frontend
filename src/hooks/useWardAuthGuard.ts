"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getWardAdminSession,
  subscribeWardSession,
} from "@/services/wardAuth.service";
import type { WardAdminSession } from "@/types/ward-admin";


export function useWardAuthGuard(wardId: string | null) {
  const router = useRouter();
  const [session, setSession] = useState<WardAdminSession | null>(null);
  const [ready, setReady] = useState(false);

  const forceLogout = useCallback(() => {
    (async () => {
      try {
        await fetch("/auth/api/auth/logout", { method: "POST" });
      } catch {
        // cookie may not exist server-side; redirect regardless
      }
      router.replace("/login");
    })();
  }, [router]);

  useEffect(() => {
    let subscribed = true;

    const apply = (stored: WardAdminSession | null) => {
      if (subscribed) setSession(stored);
    };

    try {
      apply(getWardAdminSession());
    } catch {
      apply(null);
    } finally {
      if (subscribed) setReady(true);
    }

    const unsubscribe = subscribeWardSession(apply);

    return () => {
      subscribed = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      forceLogout();
      return;
    }
    if (wardId && session.ward_id !== wardId) {
      router.replace("/ward/dashboard");
      return;
    }
  }, [ready, session, wardId, router, forceLogout]);

  const authorized = ready && Boolean(
    session && (!wardId || session.ward_id === wardId),
  );

  return { session, authorized };
}