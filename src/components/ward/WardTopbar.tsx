"use client";

import { useState, type ReactNode } from "react";
import { logoutUser } from "@/services/auth.service";
import { Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import { Menu as MenuIcon, PersonOutlined, Logout } from "@mui/icons-material";
import NotificationBell from "./NotificationBell";

interface WardTopbarProps {
  sectionLabel: string;
  subtitle?: string;
  icon?: ReactNode;
  userName: string;
  userRole: string;
  unreadCount?: number;
  notificationWardId?: string;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  onGoProfile: () => void;
}

export default function WardTopbar({
  sectionLabel,
  subtitle,
  icon,
  userName,
  userRole,
  unreadCount = 0,
  notificationWardId,
  sidebarOpen,
  onOpenSidebar,
  onGoProfile,
}: WardTopbarProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const name = userName || "Admin";

  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const goLogout = () => {
    setAnchor(null);
    try {
      logoutUser();
    } catch {}
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 flex h-16 items-center gap-4 border-b border-[#e6e8ee] bg-white px-4 sm:px-6 ${sidebarOpen ? "lg:pl-65" : "lg:pl-18"}`}>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F5F7FB] hover:text-[#0A3E9E]"
      >
        <MenuIcon sx={{ fontSize: 22 }} />
      </button>

      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8EFFC] text-[#0A3E9E]">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs text-[#9CA3AF]">
            <span>{sectionLabel}</span>
            {subtitle ? (
              <>
                <span>{">"}</span>
                <span className="font-semibold text-[#0A3E9E]">{subtitle}</span>
              </>
            ) : null}
          </div>
          <p className="text-xs text-[#6B7280]">{userRole}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {notificationWardId ? <NotificationBell wardId={notificationWardId} unread={unreadCount} /> : null}

        <div className="mx-1 h-6 w-px bg-[#e6e8ee]" />

        <button
          type="button"
          onClick={(e) => setAnchor(e.currentTarget)}
          className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-[#F5F7FB]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A3E9E] text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[13px] font-semibold text-[#374151]">{name}</span>
            <span className="block text-[11px] text-[#9CA3AF]">{userRole || "Admin"}</span>
          </span>
        </button>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          slotProps={{ paper: { sx: { borderRadius: "12px", minWidth: 200, mt: 1 } } }}
        >
          <MenuItem onClick={() => { setAnchor(null); onGoProfile(); }}>
            <ListItemIcon><PersonOutlined sx={{ fontSize: 20, color: "#0A3E9E" }} /></ListItemIcon>
            My Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={goLogout} sx={{ color: "#EF4444" }}>
            <ListItemIcon><Logout sx={{ fontSize: 20, color: "#EF4444" }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}