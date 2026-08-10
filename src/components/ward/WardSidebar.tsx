"use client";

import {
  AccountBalanceOutlined,
  DashboardOutlined,
  GroupOutlined,
  MapOutlined,
  GridViewOutlined,
  PersonOutlined,
  ChecklistOutlined,
  BadgeOutlined,
} from "@mui/icons-material";
import type { ReactNode } from "react";
import { WARD_NAV, type WardViewId } from "./wardNav";

const ICONS: Record<WardViewId, ReactNode> = {
  dashboard: <DashboardOutlined sx={{ fontSize: 20 }} />,
  citizens: <GroupOutlined sx={{ fontSize: 20 }} />,
  map: <MapOutlined sx={{ fontSize: 20 }} />,
  services: <GridViewOutlined sx={{ fontSize: 20 }} />,
  profile: <PersonOutlined sx={{ fontSize: 20 }} />,
  approvals: <ChecklistOutlined sx={{ fontSize: 20 }} />,
  idcards: <BadgeOutlined sx={{ fontSize: 20 }} />,
};

interface WardSidebarProps {
  active: WardViewId;
  onNavigate: (view: WardViewId) => void;
  wardId: string;
}

export default function WardSidebar({
  active,
  onNavigate,
  wardId,
}: WardSidebarProps) {
  const wardNumber = wardId.replace("ward-", "");

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-[#e6e8ee] bg-white">
      <div className="flex items-center gap-3 border-b border-[#e6e8ee] px-5 py-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A3E9E] text-white shadow-sm">
          <AccountBalanceOutlined sx={{ fontSize: 24 }} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#0A3E9E]">Municipality Office</p>
          <p className="truncate text-xs font-medium text-[#6B7280]">
            Kummayak Rural Municipality
          </p>
          <p className="text-[11px] text-[#9CA3AF]">Ward {wardNumber} Administration</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {WARD_NAV.map((section, i) => {
          if (section.type === "divider") {
            return <div key={`divider-${i}`} className="my-3 border-t border-[#f0f1f4]" />;
          }
          return (
            <div key={section.label} className="mb-4">
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.id === active;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors ${
                        isActive
                          ? "bg-[#E8EFFC] text-[#0A3E9E] font-semibold"
                          : "text-[#6B7280] hover:bg-[#F5F7FB] hover:text-[#0A3E9E]"
                      }`}
                    >
                      <span className={isActive ? "text-[#0A3E9E]" : "text-[#9CA3AF]"}>
                        {ICONS[item.id]}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#e6e8ee] px-5 py-3">
        <p className="text-[11px] text-[#9CA3AF]">
          Digital Nepal E-Governance System
        </p>
      </div>
    </aside>
  );
}