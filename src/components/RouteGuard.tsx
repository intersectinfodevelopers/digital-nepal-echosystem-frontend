"use client";

import type { ReactNode } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function RouteGuard({ children, requiredRole }: { children: ReactNode; requiredRole: string }) {
  const { authorized } = useAuthGuard(requiredRole);
  if (!authorized) return null;
  return <>{children}</>;
}
