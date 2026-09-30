"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AccessibleOutlined,
  ApartmentOutlined,
  BadgeOutlined,
  GroupOutlined,
  HomeOutlined,
  LogoutOutlined,
  PersonOutlined,
  PhotoCameraOutlined,
  SchoolOutlined,
  WorkOutlined,
} from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";

interface NavItem {
  label: string;
  icon: SvgIconComponent;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Personal Info", icon: PersonOutlined, href: "/ward/dashboard/registercitizen/personal" },
  { label: "NID Upload", icon: BadgeOutlined, href: "/ward/dashboard/registercitizen/nid" },
  { label: "Family Info", icon: GroupOutlined, href: "/ward/dashboard/registercitizen/family" },
  { label: "Employment", icon: WorkOutlined },
  { label: "Household", icon: HomeOutlined },
  { label: "Disability", icon: AccessibleOutlined, href: "/ward/dashboard/registercitizen/disability" },
  { label: "Education", icon: SchoolOutlined, href: "/ward/dashboard/registercitizen/education" },
  { label: "Photo", icon: PhotoCameraOutlined },
];

/* Sidebar shared by the citizen-registration flow. Deep-navy government style. */
export function DashboardSidebar({ activeLabel, onSaveExit }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[188px] shrink-0 flex-col bg-[#063477] text-white">
      {/* Branding */}
      <div className="flex items-center gap-3 px-4 pb-6 pt-7">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1D5CC0]">
          <ApartmentOutlined sx={{ fontSize: 22 }} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold leading-tight">Local Government Office</p>
          <p className="truncate text-[11px] leading-snug text-[#A9C0E4]">Kummayak Rural Municipality</p>
          <p className="truncate text-[10px] leading-snug text-[#7E9BCB]">Ward 004 Administration</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 sidebar-scrollbar">
        <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6D8CC0]">Main</p>
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeLabel
              ? activeLabel === item.label
              : pathname === item.href;

            const classes = `flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
              isActive
                ? "bg-[#1D5CC0] text-white"
                : "text-[#A9C0E4] hover:bg-white/10 hover:text-white"
            }`;

            const content = (
              <>
                <item.icon className="h-[17px] w-[17px] shrink-0" />
                <span className="truncate text-[12.5px] font-medium leading-none">{item.label}</span>
              </>
            );

            return item.href ? (
              <Link key={item.label} href={item.href} className={classes}>
                {content}
              </Link>
            ) : (
              <button key={item.label} type="button" className={classes}>
                {content}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 pb-4">
        {onSaveExit && (
          <button
            type="button"
            onClick={onSaveExit}
            className="mb-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[12.5px] font-semibold text-[#A9C0E4] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <LogoutOutlined className="h-4 w-4" />
            Save &amp; Exit
          </button>
        )}
        <p className="text-[9.5px] leading-relaxed text-[#6D8CC0]">
          Digital Nepal E-Governance System
        </p>
      </div>
    </aside>
  );
}

interface DashboardSidebarProps {
  activeLabel?: string;
  onSaveExit?: () => void;
}
