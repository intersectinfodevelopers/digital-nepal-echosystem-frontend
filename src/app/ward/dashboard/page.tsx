"use client";

import { PersonAddOutlined } from "@mui/icons-material";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";
import { getApprovalQueue, getDashboardStats, getIdCardRequests, getRecentActivity, getWardCitizens, getWardProfile } from "@/services/mockWardAdmin";
import ScopeDashboard, { type ScopeAction, type ScopeMetric } from "@/components/dashboard/ScopeDashboard";
import ActivityPanels, { type ActivityItem } from "@/components/dashboard/ActivityPanels";

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
  const recentActivity: ActivityItem[] = getRecentActivity(wardId).slice(0, 5).map((item) => ({ id: item.id, label: item.description, detail: "Ward activity", status: "Completed", time: item.time, tone: "success" }));
  const pendingActivity: ActivityItem[] = [
    ...getApprovalQueue(wardId).filter((item) => item.status === "pending").map((item) => ({ id: item.id, label: item.application_type, detail: `${item.citizen_name} · ${item.application_number}`, status: "Pending", time: item.submitted_date, tone: "pending" as const })),
    ...getIdCardRequests(wardId).filter((item) => item.status === "pending").map((item) => ({ id: item.id, label: "ID card approval", detail: `${item.citizen_name} · ${item.application_number}`, status: "Pending", time: item.submitted_date, tone: "pending" as const })),
  ];
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
  return <ScopeDashboard scope="Ward Administration" title={`Ward ${wardId.replace("ward-", "")} Dashboard`} description={`Operational overview for ${profile.ward_name} in ${profile.municipality}.`} metrics={metrics} coverageTitle="Registration Coverage" coverageSubtitle="What this ward has captured and synchronized" coverage={coverage} actions={actions}><ActivityPanels recent={recentActivity} pending={pendingActivity} /><div className="mt-7"><h2 className="text-lg font-bold text-[#101828]">Recent Citizen Records</h2><p className="mt-1 text-sm text-[#98A2B3]">Latest registrations in this ward</p><div className="mt-3 overflow-hidden rounded-[10px] border border-[#DDE2EA] bg-white"><div className="overflow-x-auto"><table className="w-full min-w-190 border-collapse text-[13px]"><thead><tr>{["Citizen", "NID", "Sync Status"].map((header) => <th key={header} className="header-cell text-left">{header}</th>)}</tr></thead><tbody>{citizens.slice(0, 8).map((citizen) => <tr key={citizen.id} className="hover:bg-[#FAFBFC]"><td className="table-cell font-bold">{citizen.name_en}</td><td className="table-cell">{citizen.nid_masked}</td><td className="table-cell">{citizen.sync_status}</td></tr>)}</tbody></table></div></div></div></ScopeDashboard>;
}
