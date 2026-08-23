"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AccessibleOutlined,
  GroupOutlined,
  HomeOutlined,
  LogoutOutlined,
  PersonOutlined,
  PhotoCameraOutlined,
  SchoolOutlined,
  UploadOutlined,
  WorkOutlined,
} from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";

interface NavItem {
  label: string;
  icon: SvgIconComponent;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Personal Info", icon: PersonOutlined, href: "/portal/personal" },
  { label: "NID Upload", icon: UploadOutlined, href: "/portal/nid" },
  { label: "Family Info", icon: GroupOutlined, href: "/portal/family" },
  { label: "Employment", icon: WorkOutlined },
  { label: "Household", icon: HomeOutlined },
  { label: "Disability", icon: AccessibleOutlined, href: "/portal/disability" },
  { label: "Education", icon: SchoolOutlined, href: "/portal/education" },
  { label: "Photo", icon: PhotoCameraOutlined },
];

interface PortalSidebarProps {
  activeLabel?: string;
  onSaveExit?: () => void;
}

export function PortalSidebar({ activeLabel, onSaveExit }: PortalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[270px] h-screen sticky top-0 bg-[#0A2D6D] text-white flex-col shrink-0 z-40">
      {/* Logo */}
      <div className="pt-[28px] px-7 pb-8">
        <p className="font-poppins font-bold text-[30px] text-white leading-tight tracking-tight">
          PRAPTI Portal
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeLabel
            ? activeLabel === item.label
            : pathname === item.href;

          const classes = `w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] text-left transition-colors duration-150 ${
            isActive
              ? "bg-[#C01F38] text-white"
              : "text-[#AEB7C7] hover:bg-white/10 hover:text-white"
          }`;

          const content = (
            <>
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="font-poppins text-[16px] font-medium leading-none">
                {item.label}
              </span>
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
      </nav>

      {/* Save & Exit */}
      <div className="p-5">
        <button
          type="button"
          onClick={onSaveExit}
          className="w-full h-[56px] rounded-[12px] bg-white text-[#0A2D6D] font-poppins font-semibold text-[16px] flex items-center justify-center gap-2 transition-colors duration-150 hover:bg-[#EFF4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <LogoutOutlined className="w-[18px] h-[18px]" />
          Save & Exit
        </button>
      </div>
    </aside>
  );
}
