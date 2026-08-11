"use client";

import { useState, useRef, useEffect } from "react";
import { Badge, IconButton, Popover, Button } from "@mui/material";
import { NotificationsNoneOutlined, DoneAll } from "@mui/icons-material";
import { getNotifications, markAllNotificationsRead } from "@/services/mockWardAdmin";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function NotificationBell({ wardId, unread }: { wardId: string; unread: number }) {
  useWardAdminStore();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAnchor(null);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);

  const open = Boolean(anchor);
  const notifications = getNotifications(wardId);

  return (
    <div ref={ref}>
      <Badge badgeContent={unread} color="error" overlap="circular">
        <IconButton
          aria-label="Notifications"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ bgcolor: "#E8EFFC", ":hover": { bgcolor: "#D6E2F8" } }}
        >
          <NotificationsNoneOutlined sx={{ fontSize: 20, color: "#0A3E9E" }} />
        </IconButton>
      </Badge>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        slotProps={{ paper: { sx: { borderRadius: "16px", width: 320, maxHeight: 420, overflow: "hidden" } } }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[15px] font-bold text-[#374151]">Notifications</span>
          <Button
            size="small"
            startIcon={<DoneAll sx={{ fontSize: 16 }} />}
            onClick={() => markAllNotificationsRead(wardId)}
            sx={{ textTransform: "none", color: "#0A3E9E", fontSize: 12 }}
          >
            Mark all read
          </Button>
        </div>
        <div className="max-h-80 divide-y divide-[#f0f1f4] overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="flex gap-3 px-4 py-3">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-[#D1D5DB]" : "bg-[#0A3E9E]"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-[#374151]">{n.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-[#6B7280]">{n.message}</p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{relativeTime(n.time)}</p>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="py-10 text-center text-sm text-[#9CA3AF]">No notifications</p>
          )}
        </div>
      </Popover>
    </div>
  );
}