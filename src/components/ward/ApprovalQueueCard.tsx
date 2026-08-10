"use client";

import { useState } from "react";
import { ChevronRight, DescriptionOutlined } from "@mui/icons-material";
import type { ApprovalItem } from "@/types/ward";
import ApprovalDetailDialog from "./ApprovalDetailDialog";

const statusTone: Record<ApprovalItem["status"], string> = {
  pending: "bg-[#FFF3E8] text-[#F97316]",
  approved: "bg-[#E9F8EF] text-[#16A34A]",
  rejected: "bg-[#FDE8E8] text-[#EF4444]",
};
const statusDot: Record<ApprovalItem["status"], string> = {
  pending: "bg-[#F97316]",
  approved: "bg-[#16A34A]",
  rejected: "bg-[#EF4444]",
};

interface ApprovalQueueCardProps {
  wardId: string;
  approvals: ApprovalItem[];
}

export default function ApprovalQueueCard({ wardId, approvals }: ApprovalQueueCardProps) {
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const pending = approvals.filter((a) => a.status === "pending");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3.5"
      >
        <span className="flex items-center gap-2 text-[15px] font-bold text-[#374151]">
          Approval Queue
          <span className="rounded-full bg-[#FFF3E8] px-2 py-0.5 text-xs font-bold text-[#F97316]">
            {pending.length}
          </span>
        </span>
      </button>

      <div className="divide-y divide-[#f0f1f4]">
        {approvals.slice(0, 4).map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelected(a)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8F9FA] active:bg-[#EEF1F6]"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${statusTone[a.status]}`}
            >
              <DescriptionOutlined sx={{ fontSize: 20 }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[14px] font-semibold text-[#374151]">
                  {a.citizen_name}
                </span>
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[a.status]}`}
                />
              </span>
              <span className="mt-0.5 block truncate text-xs text-[#6B7280]">
                {a.application_type} · {a.application_number}
              </span>
              <span className="mt-0.5 block text-[11px] text-[#9CA3AF]">
                {new Date(a.submitted_date).toLocaleString().slice(0, 17)}
              </span>
            </span>
            <span
              className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-block ${statusTone[a.status]}`}
            >
              {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
            </span>
            <ChevronRight sx={{ fontSize: 18 }} className="shrink-0 text-[#9CA3AF]" />
          </button>
        ))}
        {approvals.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#9CA3AF]">No applications yet</p>
        )}
      </div>

      {approvals.length > 4 && (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1 border-t border-[#f0f1f4] py-3 text-sm font-semibold text-[#0A3E9E] hover:bg-[#F8F9FA]"
        >
          View All ({approvals.length})
        </button>
      )}

      {selected && (
        <ApprovalDetailDialog wardId={wardId} item={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}