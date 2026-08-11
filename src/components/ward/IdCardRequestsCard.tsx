"use client";

import { useState } from "react";
import { BadgeOutlined, ChevronRight } from "@mui/icons-material";
import IdCardRequestsDialog from "./IdCardRequestsDialog";
import { getIdCardRequests } from "@/services/mockWardAdmin";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";

export default function IdCardRequestsCard({ wardId }: { wardId: string }) {
  useWardAdminStore();
  const [open, setOpen] = useState(false);
  const requests = getIdCardRequests(wardId);
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between px-4 py-3.5"
      >
        <span className="flex items-center gap-2 text-[15px] font-bold text-[#374151]">
          ID Card Requests
          <span className="rounded-full bg-[#FDE8E8] px-2 py-0.5 text-xs font-bold text-[#EF4444]">
            {pending.length}
          </span>
        </span>
        <span className="flex items-center gap-1 text-[13px] font-medium text-[#0A3E9E]">
          View All <ChevronRight sx={{ fontSize: 16 }} />
        </span>
      </button>

      <div className="divide-y divide-[#f0f1f4] border-t border-[#f0f1f4]">
        {requests.slice(0, 2).map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8F9FA]"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                r.status === "pending"
                  ? "bg-[#FFF3E8] text-[#F97316]"
                  : r.status === "approved"
                    ? "bg-[#E9F8EF] text-[#16A34A]"
                    : "bg-[#FDE8E8] text-[#EF4444]"
              }`}
            >
              <BadgeOutlined sx={{ fontSize: 20 }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-[#374151]">
                {r.citizen_name}
              </span>
              <span className="mt-0.5 block text-xs text-[#6B7280]">
                {r.application_number} · Ward {r.ward}
              </span>
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                r.status === "pending"
                  ? "bg-[#FFF3E8] text-[#F97316]"
                  : r.status === "approved"
                    ? "bg-[#E9F8EF] text-[#16A34A]"
                    : "bg-[#FDE8E8] text-[#EF4444]"
              }`}
            >
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </span>
          </button>
        ))}
        {requests.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#9CA3AF]">No ID card requests</p>
        )}
      </div>

      {open && <IdCardRequestsDialog wardId={wardId} onClose={() => setOpen(false)} />}
    </section>
  );
}