"use client";

import {
  AccountBalanceOutlined,
  Close,
  DashboardOutlined,
  GroupOutlined,
  MapOutlined,
  GridViewOutlined,
  PersonOutlined,
  ChecklistOutlined,
  BadgeOutlined,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import type { ReactNode } from "react";
import { WARD_NAV } from "./wardNav";

const ICONS: Record<string, ReactNode> = {
  dashboard: <DashboardOutlined sx={{ fontSize: 20 }} />,
  citizens: <GroupOutlined sx={{ fontSize: 20 }} />,
  map: <MapOutlined sx={{ fontSize: 20 }} />,
  "national-map": <MapOutlined sx={{ fontSize: 20 }} />,
  services: <GridViewOutlined sx={{ fontSize: 20 }} />,
  profile: <PersonOutlined sx={{ fontSize: 20 }} />,
  approvals: <ChecklistOutlined sx={{ fontSize: 20 }} />,
  idcards: <BadgeOutlined sx={{ fontSize: 20 }} />,
};

import type { AdminNavItem, AdminNavSection } from "@/types/navigation";

export type { AdminNavItem, AdminNavSection };

export function getNavItems(sections: AdminNavSection[]): AdminNavItem[] {
  return sections.flatMap((section) => (section.type === "group" ? section.items : []));
}

interface WardSidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  wardId?: string;
  collapsed?: boolean;
  onClose?: () => void;
  navSections?: AdminNavSection[];
  headerTitle?: string;
  headerSubtitle?: string;
  entityMeta?: string;
  footerLabel?: string;
}

export default function WardSidebar({
  active,
  onNavigate,
  wardId,
  collapsed = false,
  onClose,
  navSections,
  headerTitle = "Local Government Office",
  headerSubtitle = "Kummayak Rural Municipality",
  entityMeta,
  footerLabel = "Digital Nepal E-Governance System",
}: WardSidebarProps) {
  const defaultEntityMeta = wardId ? `Ward ${wardId.replace("ward-", "")} Administration` : "Administration";
  const sections = navSections ?? WARD_NAV;

  return (
    <aside className={`flex h-full shrink-0 flex-col bg-[#0B3067] text-white shadow-lg ${collapsed ? "w-18" : "w-65"}`}>
      <div className={`flex items-center gap-3 border-b border-white/10 ${collapsed ? "justify-center px-3 py-4" : "justify-between px-5 py-5"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white shadow-sm border border-white/10">
            <AccountBalanceOutlined sx={{ fontSize: 24 }} />
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white">{headerTitle}</p>
              <p className="truncate text-xs font-medium text-[#A0B3D6]">
                {headerSubtitle}
              </p>
              <p className="text-[11px] text-[#A0C8FF]">{entityMeta ?? defaultEntityMeta}</p>
            </div>
          ) : null}
        </div>
        {!collapsed && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            aria-label="Close sidebar"
          >
            <Close sx={{ fontSize: 18 }} />
            <span>Close</span>
          </button>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-1 py-3" : "px-3 py-4"}`}>
        {sections.map((section, i) => {
          if (section.type === "divider") {
            return <div key={`divider-${i}`} className="my-3 border-t border-white/10" />;
          }
          return (
            <div key={section.label} className={collapsed ? "mb-1" : "mb-4"}>
              {!collapsed ? (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A0C8FF]">
                  {section.label}
                </p>
              ) : null}
              <div className={collapsed ? "space-y-1" : "space-y-0.5"}>
                {section.items.map((item) => {
                  const isActive = item.id === active;
                  const button = (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className={`flex ${collapsed ? "w-full justify-center" : "w-full items-center gap-3"} rounded-2xl px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors ${
                        isActive
                          ? "bg-white/15 text-white font-semibold shadow-sm"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-white/70"}>
                        {item.icon ?? ICONS[item.id]}
                      </span>
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </button>
                  );
                  return collapsed ? (
                    <Tooltip key={item.id} title={item.label} placement="right" arrow>
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/10 ${collapsed ? "px-2 py-2" : "px-5 py-3"}`}>
        {!collapsed ? (
          <p className="text-[11px] text-[#A0B3D6]">
            {footerLabel}
          </p>
        ) : (
          <div className="h-10 flex items-center justify-center">
            <span className="text-[11px] text-white/60">
              {headerTitle?.includes("Local Government") ? "Local Govt" : headerTitle?.split(" ")[0] ?? "Admin"}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}