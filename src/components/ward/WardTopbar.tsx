"use client";

import { useState } from "react";
import { Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import { Menu as MenuIcon, PersonOutlined, Logout } from "@mui/icons-material";
import { getWardAdminSession, logoutWardAdmin } from "@/services/wardAuth.service";
import { getWardProfile, getNotifications } from "@/services/mockWardAdmin";
import NotificationBell from "./NotificationBell";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";
import type { WardViewId } from "./wardNav";
import { WARD_VIEW_TITLES } from "./wardNav";

interface WardTopbarProps {
  wardId: string;
  view: WardViewId;
  icon: React.ReactNode;
  onOpenSidebar: () => void;
  onGoProfile: () => void;
}

export default function WardTopbar({
  wardId,
  view,
  icon,
  onOpenSidebar,
  onGoProfile,
}: WardTopbarProps) {
  useWardAdminStore();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const profile = getWardProfile(wardId);
  const session = getWardAdminSession();
  const name = session?.admin_name || profile.admin_name || "Ward Admin";
  const title = WARD_VIEW_TITLES[view];
  const unread = getNotifications(wardId).filter((n) => !n.read).length;

  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const goLogout = () => {
    setAnchor(null);
    logoutWardAdmin();
    fetch("/auth/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#e6e8ee] bg-white px-4 sm:px-6">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F5F7FB] hover:text-[#0A3E9E] lg:hidden"
      >
        <MenuIcon sx={{ fontSize: 22 }} />
      </button>

      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8EFFC] text-[#0A3E9E]">
          {icon}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold text-[#0A3E9E]">{title}</h1>
          <p className="hidden truncate text-xs text-[#9CA3AF] sm:block">
            {profile.municipality}, Ward {profile.ward_id.replace("ward-", "")}
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell wardId={wardId} unread={unread} />

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
            <span className="block text-[11px] text-[#9CA3AF]">Ward Admin</span>
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