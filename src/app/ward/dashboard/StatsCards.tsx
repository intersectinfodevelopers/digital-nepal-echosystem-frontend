"use client";
import { stats } from "@/data/dashboard";
import type { StatTone } from "@/types/dashboard";

const toneText: Record<StatTone, string> = {
  blue: "text-[#0A3E9E]",
  orange: "text-[#F97316]",
  red: "text-[#EF4444]",
};

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex h-31.25 flex-col justify-center rounded-xs border border-[#d9d9d9] bg-white px-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
            {stat.label}
          </p>
          <p className={`mt-1 text-[40px] font-bold leading-none ${toneText[stat.tone]}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
