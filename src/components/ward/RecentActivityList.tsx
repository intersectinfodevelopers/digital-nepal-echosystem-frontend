"use client";

import type { WardActivityEntry } from "@/types/ward";
import {
  PersonAddOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  BadgeOutlined,
  CloudSyncOutlined,
  CloudOffOutlined,
} from "@mui/icons-material";

const iconMap = {
  user: { icon: <PersonAddOutlined sx={{ fontSize: 18 }} />, bg: "bg-[#E8EFFC] text-[#0A3E9E]" },
  check: { icon: <CheckCircleOutlined sx={{ fontSize: 18 }} />, bg: "bg-[#E9F8EF] text-[#16A34A]" },
  close: { icon: <CancelOutlined sx={{ fontSize: 18 }} />, bg: "bg-[#FDE8E8] text-[#EF4444]" },
  card: { icon: <BadgeOutlined sx={{ fontSize: 18 }} />, bg: "bg-[#FFF3E8] text-[#F97316]" },
  sync: { icon: <CloudSyncOutlined sx={{ fontSize: 18 }} />, bg: "bg-[#E8EFFC] text-[#0A3E9E]" },
  offline: { icon: <CloudOffOutlined sx={{ fontSize: 18 }} />, bg: "bg-[#FDE8E8] text-[#EF4444]" },
} as const;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function RecentActivityList({ activity }: { activity: WardActivityEntry[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
      <div className="border-b border-[#f0f1f4] px-4 py-3.5">
        <h2 className="text-[15px] font-bold text-[#374151]">Recent Activity</h2>
      </div>
      <div className="divide-y divide-[#f0f1f4]">
        {activity.slice(0, 6).map((a) => {
          const meta = iconMap[a.icon];
          return (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                {meta.icon}
              </span>
              <p className="min-w-0 flex-1 truncate text-[13.5px] text-[#374151]">{a.description}</p>
              <span className="shrink-0 text-[11px] text-[#9CA3AF]">{relativeTime(a.time)}</span>
            </div>
          );
        })}
        {activity.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#9CA3AF]">No activity yet</p>
        )}
      </div>
    </section>
  );
}