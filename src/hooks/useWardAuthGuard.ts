"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getWardAdminSession,
  subscribeWardSession,
} from "@/services/wardAuth.service";
import type { WardAdminSession } from "@/types/ward-admin";

/**
 * Guards a ward page: redirects unauthenticated users to /login and
 * forwards a mismatched ward id (manual URL entry) to the admin's own
 * dashboard. Returns the authenticated ward session once authorized.
 *
 * The session is resolved after mount instead of in a useState initializer
 * so that server-side rendering never reads localStorage/clients-only state,
 * which would otherwise desync the server HTML from the client render and
 * trigger React hydration errors.
 *
 * When the mock session disappears from localStorage (e.g. the user clears
 * site data in the same tab), the guard revokes the HttpOnly auth cookie
 * before redirecting to /login. Otherwise the middleware would still see the
 * valid cookie and bounce the user straight back to the dashboard.
 */
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