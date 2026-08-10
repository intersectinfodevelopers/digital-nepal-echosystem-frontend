"use client";

import { useWardAuthGuard } from "@/hooks/useWardAuthGuard";
import WardDashboardShell from "@/components/ward/WardDashboardShell";

export default function WardDashboardPage() {
  const { session, authorized } = useWardAuthGuard(null);

  if (!authorized || !session) return null;

  return <WardDashboardShell wardId={session.ward_id} />;
}