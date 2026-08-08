"use client";
import { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import { activities as staticActivities } from "@/data/dashboard";
import type { RecentActivityItem } from "@/types/dashboard";
import { getActivities, subscribeActivities } from "@/services/activityService";

export default function RecentActivity() {
  const [live, setLive] = useState<RecentActivityItem[]>(() => getActivities());

  useEffect(() => {
    return subscribeActivities(() => setLive(getActivities()));
  }, []);

  const activities = [...live, ...staticActivities];

  return (
    <section className="overflow-hidden rounded-xs border border-[#d8d8d8] bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-[22px] font-bold uppercase text-[#374151]">
          Recent Activity
        </h2>
        <button
          type="button"
          className="text-[14px] font-medium text-[#6B7280] transition-colors hover:text-[#0A3E9E]"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f5f5f5] text-[15px] font-semibold text-[#374151]">
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">NID</th>
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((row, i) => (
              <tr
                key={`${row.nid}-${i}`}
                className="border-t border-[#f0f0f0] text-[15px] transition-colors duration-150 hover:bg-[#F8F9FA]"
              >
                <td className="px-6 py-3.5 font-medium text-[#374151]">
                  {row.name}
                </td>
                <td className="px-4 py-3.5 text-[14px] text-[#6B7280]">
                  {row.nid}
                </td>
                <td className="px-4 py-3.5 text-[14px] text-[#6B7280]">
                  {row.time}
                </td>
                <td className="px-4 py-3.5 text-[#374151]">{row.action}</td>
                <td className="px-6 py-3.5">
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      backgroundColor: "#FFE9D1",
                      color: "#F97316",
                      fontWeight: 600,
                      fontSize: "12px",
                      height: 24,
                      borderRadius: "9999px",
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[#d8d8d8] py-3 text-center text-[13px] text-[#9CA3AF]">
        No earlier activity for today
      </div>
    </section>
  );
}
