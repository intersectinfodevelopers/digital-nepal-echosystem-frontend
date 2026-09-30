"use client";

import type { ReactNode } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function WardRouteGuard({ children }: { children: ReactNode }) {
  // Ward guard requires role WARD_ADMIN and optionally wardId matching is enforced elsewhere in UI
  const { authorized } = useAuthGuard("WARD_ADMIN");

  if (!authorized) return null;

  return <>{children}</>;
}
