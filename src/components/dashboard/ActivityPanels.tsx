"use client";

import {
  BadgeOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
  ReportProblemOutlined,
  ScheduleOutlined,
} from "@mui/icons-material";

export type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  status: string;
  time: string;
  tone: "success" | "pending" | "warning";
};

const toneStyles = {
  success: "text-[#087443]",
  pending: "text-[#B54708]",
  warning: "text-[#C01F38]",
} as const;

function ActivityIcon({ type }: { type: ActivityItem["tone"] }) {
  const icon = type === "success" ? <CheckCircleOutlined sx={{ fontSize: 17 }} /> : type === "warning" ? <ReportProblemOutlined sx={{ fontSize: 17 }} /> : <ScheduleOutlined sx={{ fontSize: 17 }} />;
  const background = type === "success" ? "bg-[#E7F8EF] text-[#00A866]" : type === "warning" ? "bg-[#FDEDEC] text-[#F0002E]" : "bg-[#FEF3E2] text-[#EC7600]";
  return <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${background}`}>{icon}</span>;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ActivityList({ items, emptyLabel }: { items: ActivityItem[]; emptyLabel: string }) {
  return <div className="divide-y divide-[#EAECF0]">{items.slice(0, 5).map((item) => <div key={item.id} className="flex min-w-0 items-center gap-3 px-4 py-3"><ActivityIcon type={item.tone} /><div className="min-w-0 flex-1"><p className="truncate text-[12.5px] font-semibold text-[#344054]">{item.label}</p><p className="truncate text-[11px] text-[#98A2B3]">{item.detail}</p></div><div className="shrink-0 text-right"><p className={`text-[11px] font-semibold ${toneStyles[item.tone]}`}>{item.status}</p><p className="mt-0.5 text-[10px] text-[#98A2B3]">{formatTime(item.time)}</p></div></div>)}{items.length === 0 ? <p className="px-4 py-8 text-center text-sm text-[#98A2B3]">{emptyLabel}</p> : null}</div>;
}

function ActivityPanel({ title, subtitle, items, emptyLabel }: { title: string; subtitle: string; items: ActivityItem[]; emptyLabel: string }) {
  return <section className="overflow-hidden rounded-[10px] border border-[#DDE2EA] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.08)]"><div className="flex items-start justify-between gap-3 border-b border-[#EAECF0] px-4 py-3.5"><div><h2 className="text-[15px] font-bold text-[#101828]">{title}</h2><p className="mt-0.5 text-[11px] text-[#98A2B3]">{subtitle}</p></div><div className="flex items-center gap-1.5"><button type="button" aria-label="Filter by date" className="flex h-7 items-center gap-1 rounded-md border border-[#D0D5DD] px-2 text-[10px] font-semibold text-[#667085]"><BadgeOutlined sx={{ fontSize: 13 }} />Date</button><button type="button" className="flex h-7 items-center rounded-md border border-[#D0D5DD] px-2 text-[10px] font-semibold text-[#667085]">View More</button></div></div><ActivityList items={items} emptyLabel={emptyLabel} /></section>;
}

export default function ActivityPanels({ recent, pending }: { recent: ActivityItem[]; pending: ActivityItem[] }) {
  return <div className="mt-7 grid gap-5 xl:grid-cols-2"><ActivityPanel title="Recent Activity" subtitle="Latest updates from this administrative area" items={recent} emptyLabel="No recent activity" /><ActivityPanel title="Pending Activity" subtitle="Items requiring attention" items={pending} emptyLabel="No pending activity" /></div>;
}

export function activityDetailIcon(type: "sync" | "card" | "grievance") {
  if (type === "sync") return <CloudSyncOutlined sx={{ fontSize: 15 }} />;
  if (type === "card") return <BadgeOutlined sx={{ fontSize: 15 }} />;
  return <ReportProblemOutlined sx={{ fontSize: 15 }} />;
}
