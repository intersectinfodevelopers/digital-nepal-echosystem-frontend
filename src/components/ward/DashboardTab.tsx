"use client";

import Link from "next/link";
import { PersonAddOutlined, PersonOutlined, ChecklistOutlined, BadgeOutlined, CheckCircleOutlined, CancelOutlined } from "@mui/icons-material";
import StatCard from "./StatCard";
import ApprovalQueueCard from "./ApprovalQueueCard";
import {
  getDashboardStats,
  getRecentActivity,
  getApprovalQueue,
  getWardProfile,
  getWardCitizens,
  getIdCardRequests,
} from "@/services/mockWardAdmin";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";

const statusBadge: Record<string, string> = {
  pending: "text-[#F97316] bg-[#FFF3E8]",
  approved: "text-[#16A34A] bg-[#E9F8EF]",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardTab({ wardId }: { wardId: string }) {
  useWardAdminStore();

  const stats = getDashboardStats(wardId);
  const activity = getRecentActivity(wardId);
  const approvals = getApprovalQueue(wardId).filter((a) => a.status === "pending");
  const profile = getWardProfile(wardId);
  const citizens = getWardCitizens(wardId);
  const idRequests = getIdCardRequests(wardId);

  const recentRegistrations = [...citizens]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3E9E]">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            Welcome back, {profile.admin_name}. Here is the latest activity for Ward{" "}
            {profile.ward_id.replace("ward-", "")}.
          </p>
        </div>
        <Link
          href="/portal/personal"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0A3E9E] px-5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#083078] active:scale-[0.99]"
        >
          <PersonAddOutlined sx={{ fontSize: 18 }} /> Register Citizen
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Registered Today" value={stats.registered_today} tone="blue" icon={<PersonOutlined sx={{ fontSize: 18 }} />} />
        <StatCard label="Pending Approvals" value={stats.pending_approvals} tone="orange" icon={<ChecklistOutlined sx={{ fontSize: 18 }} />} />
        <StatCard label="ID Card Requests" value={stats.id_card_requests} tone="red" icon={<BadgeOutlined sx={{ fontSize: 18 }} />} />
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <ApprovalQueueCard wardId={wardId} approvals={approvals} />

        {/* Recent activity */}
        <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
          <div className="border-b border-[#f0f1f4] px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#374151]">Recent Activity</h2>
          </div>
          <div className="divide-y divide-[#f0f1f4]">
            {activity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8EFFC] text-[#0A3E9E]">
                  {a.icon === "card" ? <BadgeOutlined sx={{ fontSize: 18 }} /> : a.icon === "check" ? <CheckCircleOutlined sx={{ fontSize: 18 }} /> : a.icon === "close" ? <CancelOutlined sx={{ fontSize: 18 }} /> : <PersonOutlined sx={{ fontSize: 18 }} />}
                </span>
                <p className="min-w-0 flex-1 truncate text-[13.5px] text-[#374151]">{a.description}</p>
                <span className="shrink-0 text-[11px] text-[#9CA3AF]">{timeAgo(a.time)}</span>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-[#9CA3AF]">No activity yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Secondary panels */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Recent registrations */}
        <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
          <div className="border-b border-[#f0f1f4] px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#374151]">Recent Registrations</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] text-[11px] uppercase tracking-wide text-[#6B7280]">
                <th className="px-5 py-2.5 font-semibold">Citizen</th>
                <th className="hidden px-5 py-2.5 font-semibold sm:table-cell">NID</th>
                <th className="px-5 py-2.5 font-semibold">Ward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {recentRegistrations.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-5 py-3 font-medium text-[#374151]">{c.name_en}</td>
                  <td className="hidden px-5 py-3 text-xs text-[#6B7280] sm:table-cell">{c.nid_masked}</td>
                  <td className="px-5 py-3 text-[#6B7280]">Ward {wardId.replace("ward-", "")}</td>
                </tr>
              ))}
              {recentRegistrations.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-[#9CA3AF]">
                    No registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Recent ID card requests */}
        <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
          <div className="border-b border-[#f0f1f4] px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#374151]">ID Card Requests</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] text-[11px] uppercase tracking-wide text-[#6B7280]">
                <th className="px-5 py-2.5 font-semibold">Request</th>
                <th className="px-5 py-2.5 font-semibold">Citizen</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {idRequests.slice(0, 4).map((r) => (
                <tr key={r.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-5 py-3 font-semibold text-[#0A3E9E]">{r.application_number}</td>
                  <td className="px-5 py-3 font-medium text-[#374151]">{r.citizen_name}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge[r.status] ?? statusBadge.pending}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {idRequests.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-[#9CA3AF]">
                    No ID card requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}