"use client";

import { useState } from "react";
import { ChevronRight, Search, DescriptionOutlined } from "@mui/icons-material";
import { getApprovalQueue } from "@/services/mockWardAdmin";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";
import ApprovalDetailDialog from "./ApprovalDetailDialog";
import type { ApprovalItem } from "@/types/ward";

const statusTone: Record<ApprovalItem["status"], string> = {
  pending: "bg-[#FFF3E8] text-[#F97316]",
  approved: "bg-[#E9F8EF] text-[#16A34A]",
  rejected: "bg-[#FDE8E8] text-[#EF4444]",
};

export default function ApprovalQueueTab({ wardId }: { wardId: string }) {
  useWardAdminStore();
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<ApprovalItem | null>(null);

  const queue = getApprovalQueue(wardId);

  const services = Array.from(new Set(queue.map((a) => a.application_type)));

  const filtered = queue.filter((a) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = `${a.citizen_name} ${a.application_number} ${a.application_type}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (serviceFilter && a.application_type !== serviceFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0A3E9E]">Approval Queue</h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Review and approve applications for Ward {wardId.replace("ward-", "")}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e6e8ee] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            placeholder="Search by name, application #, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#e6e8ee] bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-[#0A3E9E] focus:ring-2 focus:ring-[#0A3E9E]/15"
          />
          <Search sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-lg border border-[#e6e8ee] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0A3E9E]"
        >
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#e6e8ee] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0A3E9E]"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] text-[11px] uppercase tracking-wide text-[#6B7280]">
                <th className="px-5 py-3 font-semibold">Application</th>
                <th className="px-5 py-3 font-semibold">Citizen</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Service</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Ward</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {filtered.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-[#F8F9FA]">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8EFFC] text-[#0A3E9E]">
                        <DescriptionOutlined sx={{ fontSize: 18 }} />
                      </span>
                      <span className="font-semibold text-[#0A3E9E]">{a.application_number}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[#374151]">{a.citizen_name}</td>
                  <td className="hidden px-5 py-3.5 text-[#6B7280] md:table-cell">{a.application_type}</td>
                  <td className="hidden px-5 py-3.5 text-[#6B7280] lg:table-cell">Ward {a.ward_number}</td>
                  <td className="hidden px-5 py-3.5 text-[#6B7280] md:table-cell">
                    {new Date(a.submitted_date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone[a.status]}`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(a)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#0A3E9E] px-3 py-1.5 text-[12.5px] font-semibold text-[#0A3E9E] transition-colors hover:bg-[#E8EFFC]"
                    >
                      {a.status === "pending" ? "Review" : "View"} <ChevronRight sx={{ fontSize: 14 }} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#9CA3AF]">
                    No applications match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && <ApprovalDetailDialog wardId={wardId} item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}