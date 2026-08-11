"use client";

import { useState } from "react";
import { BadgeOutlined, ChevronRight } from "@mui/icons-material";
import { getIdCardRequests } from "@/services/mockWardAdmin";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";
import IdCardRequestsDialog from "./IdCardRequestsDialog";
import type { IdCardRequest } from "@/types/ward";

const statusTone: Record<string, string> = {
  pending: "bg-[#FFF3E8] text-[#F97316]",
  approved: "bg-[#E9F8EF] text-[#16A34A]",
  rejected: "bg-[#FDE8E8] text-[#EF4444]",
};

export default function IdCardRequestsTab({ wardId }: { wardId: string }) {
  useWardAdminStore();
  const [open, setOpen] = useState(false);
  const requests = getIdCardRequests(wardId);

  const summary: Record<string, number> = {};
  requests.forEach((r) => {
    summary[r.status] = (summary[r.status] ?? 0) + 1;
  });

  const summaryCards = [
    { label: "Total", value: requests.length, tone: "text-[#0A3E9E]" },
    { label: "Pending", value: summary["pending"] ?? 0, tone: "text-[#F97316]" },
    { label: "Approved", value: summary["approved"] ?? 0, tone: "text-[#16A34A]" },
    { label: "Rejected", value: summary["rejected"] ?? 0, tone: "text-[#EF4444]" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0A3E9E]">ID Card Requests</h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Track national ID card requests for Ward {wardId.replace("ward-", "")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-[#e6e8ee] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">{c.label}</p>
            <p className={`mt-2 text-3xl font-bold ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#f0f1f4] px-5 py-4">
          <h2 className="text-[15px] font-bold text-[#374151]">Requests</h2>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#0A3E9E] px-3 py-1.5 text-[12.5px] font-semibold text-[#0A3E9E] transition-colors hover:bg-[#E8EFFC]"
          >
            Manage Requests <ChevronRight sx={{ fontSize: 14 }} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] text-[11px] uppercase tracking-wide text-[#6B7280]">
                <th className="px-5 py-3 font-semibold">Request</th>
                <th className="px-5 py-3 font-semibold">Citizen</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Ward</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {requests.map((r: IdCardRequest) => (
                <tr key={r.id} className="transition-colors hover:bg-[#F8F9FA]">
                  <td className="px-5 py-3.5 font-semibold text-[#0A3E9E]">{r.application_number}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8EFFC] text-[#0A3E9E]">
                        <BadgeOutlined sx={{ fontSize: 16 }} />
                      </span>
                      <span className="font-medium text-[#374151]">{r.citizen_name}</span>
                    </span>
                  </td>
                  <td className="hidden px-5 py-3.5 text-[#6B7280] md:table-cell">Ward {r.ward}</td>
                  <td className="hidden px-5 py-3.5 text-[#6B7280] md:table-cell">
                    {new Date(r.submitted_date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone[r.status] ?? statusTone.pending}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#0A3E9E] px-3 py-1.5 text-[12.5px] font-semibold text-[#0A3E9E] transition-colors hover:bg-[#E8EFFC]"
                    >
                      Review <ChevronRight sx={{ fontSize: 14 }} />
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#9CA3AF]">
                    No ID card requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {open && <IdCardRequestsDialog wardId={wardId} onClose={() => setOpen(false)} />}
    </div>
  );
}