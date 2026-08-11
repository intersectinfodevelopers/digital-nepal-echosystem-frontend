"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import DashboardTab from "@/components/ward/DashboardTab";

export default function WardDashboardPage() {
  const { session, authorized } = useAuthGuard("WARD_ADMIN");

  if (!authorized || !session || !session.ward_id) return null;

  return <DashboardTab wardId={session.ward_id} />;
}
