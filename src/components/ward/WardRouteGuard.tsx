"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function WardRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ['ward', 'ward-004', 'dashboard']
   const firstSegment = segments[1] ?? "";
   const wardId = firstSegment.startsWith("ward-") ? firstSegment : null;
 
   // ward guard requires role WARD_ADMIN and optionally wardId matching is enforced elsewhere in UI
   const { authorized } = useAuthGuard("WARD_ADMIN");

  if (!authorized) return null;

  return <>{children}</>;
}