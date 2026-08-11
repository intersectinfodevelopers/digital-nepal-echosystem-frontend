"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentSession, subscribeSession, logoutUser, ROLE_HOME_ROUTE } from "@/services/auth.service";
import type { LoginSession } from "@/types/auth";

export function useAuthGuard(requiredRole?: string) {
  const router = useRouter();
  const [session, setSession] = useState<LoginSession | null>(null);
  const [ready, setReady] = useState(false);

  const forceLogout = useCallback(() => {
    (async () => {
      try {
        logoutUser();
      } catch {}
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}
      router.replace("/login");
    })();
  }, [router]);

  useEffect(() => {
    let subscribed = true;

    const apply = (stored: LoginSession | null) => {
      if (subscribed) setSession(stored);
    };

    try {
      apply(getCurrentSession());
    } catch {
      apply(null);
    } finally {
      if (subscribed) setReady(true);
    }

    const unsubscribe = subscribeSession(apply);

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
    if (requiredRole && session.role !== requiredRole) {
      router.replace(ROLE_HOME_ROUTE[session.role]);
      return;
    }
  }, [ready, session, requiredRole, router, forceLogout]);

  const authorized = ready && Boolean(session && (!requiredRole || session.role === requiredRole));

  return { session, authorized };
}
