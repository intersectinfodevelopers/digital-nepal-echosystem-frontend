"use client";

import { PersonAddOutlined } from "@mui/icons-material";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";
import { getApprovalQueue, getDashboardStats, getIdCardRequests, getWardCitizens, getWardProfile } from "@/services/mockWardAdmin";
import ScopeDashboard, { type ScopeAction, type ScopeMetric } from "@/components/dashboard/ScopeDashboard";

const number = (value: number) => value.toLocaleString("en-US");

export default function WardDashboardPage() {
  const { session, authorized } = useAuthGuard("WARD_ADMIN");
  useWardAdminStore();
  if (!authorized || !session?.ward_id) return null;

  const wardId = session.ward_id;
  const stats = getDashboardStats(wardId);
  const citizens = getWardCitizens(wardId);
  const approvals = getApprovalQueue(wardId).filter((item) => item.status === "pending").length;
  const idRequests = getIdCardRequests(wardId).filter((item) => item.status === "pending").length;
  const profile = getWardProfile(wardId);
  const metrics: ScopeMetric[] = [
    { label: "Registered Citizens", value: number(citizens.length), foot: `${stats.registered_today} registered today`, accent: "navy", icon: "♙" },
    { label: "Pending Approvals", value: approvals, foot: "Requires ward review", accent: "orange", icon: "◷" },
    { label: "ID Card Requests", value: idRequests, foot: "Awaiting processing", accent: "purple", icon: "▣" },
    { label: "Pending Sync", value: stats.pending_sync, foot: "Records awaiting sync", accent: "red", icon: "↻" },
    { label: "Ward Number", value: wardId.replace("ward-", ""), foot: profile.municipality, accent: "blue", icon: "▤" },
    { label: "Sync Status", value: stats.pending_sync ? "Pending" : "Healthy", foot: "Ward data connection", accent: stats.pending_sync ? "orange" : "green", icon: "✓" },
  ];
  const coverage: ScopeMetric[] = [
    { label: "Registered Today", value: stats.registered_today, foot: "New citizen records", accent: "blue", icon: "♙" },
    { label: "Approval Queue", value: approvals, foot: "Applications to review", accent: "orange", icon: "✓" },
    { label: "ID Card Requests", value: idRequests, foot: "Citizen requests", accent: "purple", icon: "▣" },
    { label: "Pending Sync", value: stats.pending_sync, foot: "Upload to municipality", accent: "red", icon: "↻" },
  ];
  const actions: ScopeAction[] = [
    { href: "/ward/dashboard/registercitizen", title: "Register Citizen", description: "Capture a new citizen record for this ward.", cta: "Start Registration →", accent: "navy", icon: <PersonAddOutlined sx={{ fontSize: 20 }} /> },
    { href: "/ward/citizens", title: "Citizen Records", description: "Search and review citizens registered in this ward.", cta: "Open Records →", accent: "purple", icon: "♙" },
    { href: "/ward/approvals", title: "Approval Queue", description: "Review pending changes and service applications.", cta: "Review Queue →", accent: "orange", icon: "✓" },
    { href: "/ward/map", title: "Ward Map", description: "View citizen locations and ward coverage on the map.", cta: "Open Map →", accent: "blue", icon: "⌖" },
  ];
  return <ScopeDashboard scope="Ward Administration" title={`Ward ${wardId.replace("ward-", "")} Dashboard`} description={`Operational overview for ${profile.ward_name} in ${profile.municipality}.`} metrics={metrics} coverageTitle="Registration Coverage" coverageSubtitle="What this ward has captured and synchronized" coverage={coverage} actions={actions} table={{ title: "Recent Citizen Records", subtitle: "Latest registrations in this ward", headers: ["Citizen", "NID", "Sync Status"], rows: citizens.slice(0, 8).map((citizen) => [citizen.name_en, citizen.nid_masked, citizen.sync_status]) }} />;
}
