"use client";

import { useState, type ReactNode } from "react";
import { logoutUser } from "@/services/auth.service";
import { Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import {
  Menu as MenuIcon,
  PersonOutlined,
  Logout,
  NotificationsNoneOutlined,
} from "@mui/icons-material";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/services/mockWardAdmin";

interface WardTopbarProps {
  sectionLabel: string;
  subtitle?: string;
  wardBadge?: string;
  icon?: ReactNode;
  userName: string;
  userRole: string;
  unreadCount?: number;
  notificationWardId?: string;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  onGoProfile: () => void;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 24 * 60) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / (24 * 60))}d`;
}

export default function WardTopbar({
  sectionLabel,
  wardBadge,
  icon,
  userName,
  userRole,
  unreadCount = 0,
  notificationWardId,
  onOpenSidebar,
  onGoProfile,
}: WardTopbarProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const name = userName || "Admin";
  useWardAdminStore();

  const notifications = notificationWardId
    ? getNotifications(notificationWardId)
    : [];

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
    <header className="sticky top-0 z-30 flex h-[62px] shrink-0 items-center gap-3 border-b border-[#E5E7EB] bg-white px-4 sm:px-6">
      {/* Circular menu button */}
      <button
        type="button"
        aria-label="Toggle navigation"
        onClick={onOpenSidebar}
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-[#E1E5EB] bg-white text-[#6B7280] transition-colors hover:bg-[#F5F7FB] hover:text-[#063574]"
      >
        <MenuIcon sx={{ fontSize: 20 }} />
      </button>

      {/* Location breadcrumb + ward badge */}
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="truncate text-[13px] font-medium text-[#111827]">
          {sectionLabel}
        </span>
        {wardBadge ? (
          <span className="ml-1 hidden h-[25px] shrink-0 items-center rounded-md bg-[#E8F0FB] px-2.5 text-xs font-medium text-[#2A4D9B] sm:inline-flex">
            {wardBadge}
          </span>
        ) : null}
        <span className="hidden text-[#4174C8] lg:inline-flex">{icon}</span>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Notification button with red dot */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={(e) => setNotifAnchor(e.currentTarget)}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#E1E5EB] bg-white text-[#6B7280] transition-colors hover:bg-[#F5F7FB] hover:text-[#063574]"
          >
            <NotificationsNoneOutlined sx={{ fontSize: 20 }} />
            {unreadCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-[#EF4444]" />
            ) : null}
          </button>

          {notifAnchor ? (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifAnchor(null)}
              />
              <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-[#E1E6ED] bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#EAECF0] px-4 py-3">
                  <span className="text-sm font-bold text-[#101828]">Notifications</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (notificationWardId) {
                        markAllNotificationsRead(notificationWardId);
                      }
                      setNotifAnchor(null);
                    }}
                    className="text-xs font-semibold text-[#4174C8] hover:text-[#2F5FAF]"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 divide-y divide-[#EAECF0] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex gap-3 px-4 py-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.read ? "bg-[#D1D5DB]" : "bg-[#4174C8]"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[#344054]">{n.title}</p>
                        <p className="mt-0.5 text-xs leading-snug text-[#667085]">{n.message}</p>
                        <p className="mt-0.5 text-[11px] text-[#98A2B3]">{relativeTime(n.time)}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="py-10 text-center text-sm text-[#98A2B3]">No notifications</p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="mx-1 h-6 w-px bg-[#E1E6ED]" />

        {/* User profile */}
        <button
          type="button"
          onClick={(e) => setAnchor(e.currentTarget)}
          className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-[#F5F7FB]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C5CBF] text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[13px] font-semibold leading-tight text-[#111827]">
              {name}
            </span>
            <span className="block text-[11px] leading-tight text-[#8B8F96]">
              {userRole || "Admin"}
            </span>
          </span>
        </button>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          slotProps={{ paper: { sx: { borderRadius: "12px", minWidth: 200, mt: 1 } } }}
        >
          <MenuItem onClick={() => { setAnchor(null); onGoProfile(); }}>
            <ListItemIcon>
              <PersonOutlined sx={{ fontSize: 20, color: "#063574" }} />
            </ListItemIcon>
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