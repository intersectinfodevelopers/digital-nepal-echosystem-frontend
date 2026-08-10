"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useWardAuthGuard } from "@/hooks/useWardAuthGuard";

export default function WardRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ['ward', 'ward-004', 'dashboard']
  const firstSegment = segments[1] ?? "";
  const wardId = firstSegment.startsWith("ward-") ? firstSegment : null;

  const { authorized } = useWardAuthGuard(wardId);

  if (!authorized) return null;

  return <>{children}</>;
}