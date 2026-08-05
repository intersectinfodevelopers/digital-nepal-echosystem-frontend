"use client";
import { Divider } from "@mui/material";
import { AlertTriangle, Bell, ChevronRight } from "lucide-react";
import { alerts } from "@/data/dashboard";

export default function AlertsPanel() {
  return (
    <section className="overflow-hidden rounded-xs border border-[#d9d9d9] bg-white">
      <div className="flex items-center gap-2 bg-[#FEF2F2] px-5 py-3.5">
        <Bell size={18} className="text-[#EF4444]" />
        <h2 className="text-[15px] font-bold text-[#EF4444]">Alerts</h2>
        <AlertTriangle size={14} className="ml-auto text-[#EF4444]/60" />
      </div>
      {alerts.map((alert, index) => (
        <div key={alert.label}>
          <button
            type="button"
            className="flex h-13 w-full items-center justify-between px-5 text-left text-[15px] text-[#374151] transition-colors duration-150 hover:bg-[#F8F9FA]"
          >
            <span>{alert.label}</span>
            <ChevronRight size={18} className="text-[#9CA3AF]" />
          </button>
          {index < alerts.length - 1 && (
            <Divider sx={{ borderColor: "#f0f0f0" }} />
          )}
        </div>
      ))}
    </section>
  );
}
