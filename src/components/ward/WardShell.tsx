"use client";

import { useState } from "react";
import { Drawer, useMediaQuery } from "@mui/material";
import {
  HomeOutlined,
  GroupOutlined,
  MapOutlined,
  GridViewOutlined,
  PersonOutlined,
  ChecklistOutlined,
  BadgeOutlined,
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentSession } from "@/services/auth.service";
import { getNotifications } from "@/services/mockWardAdmin";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import WardSidebar from "./WardSidebar";
import WardTopbar from "./WardTopbar";
import type { WardViewId } from "@/types/navigation";
import { WARD_VIEW_TITLES } from "./wardNav";

const VIEW_ICONS: Record<WardViewId, ReactNode> = {
  dashboard: <HomeOutlined sx={{ fontSize: 20 }} />,
  citizens: <GroupOutlined sx={{ fontSize: 20 }} />,
  map: <MapOutlined sx={{ fontSize: 20 }} />,
  "national-map": <MapOutlined sx={{ fontSize: 20 }} />,
  services: <GridViewOutlined sx={{ fontSize: 20 }} />,
  profile: <PersonOutlined sx={{ fontSize: 20 }} />,
  approvals: <ChecklistOutlined sx={{ fontSize: 20 }} />,
  idcards: <BadgeOutlined sx={{ fontSize: 20 }} />,
};

const VIEW_PATHS: Record<WardViewId, string> = {
  dashboard: "/ward/dashboard",
  citizens: "/ward/citizens",
  map: "/ward/dashboard",
  "national-map": "/central/national-map",
  services: "/ward/dashboard",
  profile: "/ward/dashboard",
  approvals: "/ward/dashboard",
  idcards: "/ward/dashboard",
};

function getActiveView(pathname: string): WardViewId {
  if (pathname.startsWith("/ward/citizens")) return "citizens";
  return "dashboard";
}

export default function WardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width:1024px)");

  const activeView = getActiveView(pathname);
  const session = getCurrentSession();
  const wardId = session?.ward_id ?? "ward-001";
  const wardNumber = wardId.replace("ward-", "");
  const unread = getNotifications(wardId).filter((n) => !n.read).length;

  const handleNavigate = (id: string) => {
    setMobileOpen(false);
    const view = id as WardViewId;
    const path = VIEW_PATHS[view] ?? id;
    router.push(path);
  };

  const handleToggleDesktopSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleOpenSidebar = () => {
    if (isDesktop) {
      handleToggleDesktopSidebar();
    } else {
      setMobileOpen(true);
    }
  };

  const closeMobileDrawer = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 z-40">
          <WardSidebar
            active={activeView}
            onNavigate={handleNavigate}
            wardId={"ward-001"}
            collapsed={!sidebarOpen}
          />
        </div>
      </div>
      <Drawer
        open={mobileOpen && !isDesktop}
        onClose={closeMobileDrawer}
        slotProps={{ paper: { sx: { borderRadius: 0, width: 260 } } }}
      >
        <WardSidebar
          active={activeView}
          onNavigate={handleNavigate}
          wardId={"ward-001"}
          onClose={closeMobileDrawer}
        />
      </Drawer>
      <div
        className={`flex min-w-0 flex-1 flex-col ${sidebarOpen ? "lg:pl-65" : "lg:pl-18"}`}
      >
        <WardTopbar
          sectionLabel={`Ward ${wardNumber}`}
          subtitle={WARD_VIEW_TITLES[activeView]}
          icon={VIEW_ICONS[activeView]}
          userName={session?.full_name ?? "Ward Admin"}
          userRole={session?.role ?? "Ward Admin"}
          unreadCount={unread}
          notificationWardId={wardId}
          sidebarOpen={sidebarOpen}
          onOpenSidebar={handleOpenSidebar}
          onGoProfile={() => router.push("/ward/dashboard")}
        />
        <main className="flex-1 px-4 pt-20 pb-6 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Breadcrumbs />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
