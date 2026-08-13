"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { StatTone } from "@/types/dashboard";

export type { StatTone };

const toneClasses: Record<StatTone, { value: string; badge: string }> = {
  blue: { value: "text-[#0A3E9E]", badge: "bg-[#E8EFFC] text-[#0A3E9E]" },
  orange: { value: "text-[#F97316]", badge: "bg-[#FFF3E8] text-[#F97316]" },
  red: { value: "text-[#EF4444]", badge: "bg-[#FDE8E8] text-[#EF4444]" },
  green: { value: "text-[#16A34A]", badge: "bg-[#E9F8EF] text-[#16A34A]" },
};

interface StatCardProps {
  label: string;
  value: number;
  tone: StatTone;
  icon?: ReactNode;
}

export default function StatCard({ label, value, tone, icon }: StatCardProps) {
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const from = previous.current;
    const to = value;
    previous.current = to;
    const diff = to - from;
    if (diff === 0) {
      setDisplay(to);
      return;
    }
    const duration = 500;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + diff * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const t = toneClasses[tone];

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-[#e6e8ee] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
          {label}
        </span>
        {icon ? (
          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${t.badge}`}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className={`mt-2 text-3xl font-bold leading-none ${t.value}`}>{display}</p>
    </div>
  );
}