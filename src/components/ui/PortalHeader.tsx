import React from "react";
import {
  AccountCircleOutlined,
  LockOutlined,
  NotificationsNoneOutlined,
  ShieldOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";

interface PortalHeaderProps {
  variant?: "default" | "encryption";
}

export function PortalHeader({ variant = "default" }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[70px] shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 md:px-10">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0E3A8A]">
          <VerifiedUserOutlined className="h-5 w-5 text-white" />
        </span>
        <span className="font-poppins text-[24px] font-bold uppercase leading-none tracking-[0.02em] text-[#0E3A8A]">
          PRAPTI
        </span>
      </div>

      {variant === "encryption" ? (
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-[6px] border border-[#D6E4FF] bg-[#EEF4FF] px-3 py-1.5">
            <LockOutlined className="h-3.5 w-3.5 text-[#0A2D6D]" />
            <span className="font-poppins text-[12px] font-semibold text-[#0A2D6D]">
              ENCRYPTION: AES-256-GCM
            </span>
          </span>
          <ShieldOutlined
            aria-label="Secure portal"
            className="h-6 w-6 text-[#0A2D6D]"
          />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0E3A8A] transition-colors hover:bg-[#F1F5F9]"
          >
            <NotificationsNoneOutlined className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C2183B]" />
          </button>
          <button
            type="button"
            aria-label="User profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0E3A8A] transition-colors hover:bg-[#F1F5F9]"
          >
            <AccountCircleOutlined className="h-6 w-6" />
          </button>
        </div>
      )}
    </header>
  );
}
