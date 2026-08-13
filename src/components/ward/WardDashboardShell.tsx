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
import type { ReactNode } from "react";
import WardSidebar from "./WardSidebar";
import WardTopbar from "./WardTopbar";
import DashboardTab from "./DashboardTab";
import CitizensTab from "./CitizensTab";
import MapTab from "./MapTab";
import NationalMapTab from "./NationalMapTab";
import ServicesTab from "./ServicesTab";
import ProfileTab from "./ProfileTab";
import ApprovalQueueTab from "./ApprovalQueueTab";
import IdCardRequestsTab from "./IdCardRequestsTab";
import type { WardViewId } from "@/types/navigation";
import { WARD_VIEW_TITLES } from "./wardNav";
import { getCurrentSession } from "@/services/auth.service";
import { getNotifications } from "@/services/mockWardAdmin";

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

export default function WardDashboardShell({ wardId }: { wardId: string }) {
  const [view, setView] = useState<WardViewId>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width:1024px)");

  const renderView = (v: WardViewId) => {
    switch (v) {
      case "citizens":
        return <CitizensTab wardId={wardId} />;
      case "map":
      case "national-map":
        return <MapTab wardId={wardId} />;
      case "national-map":
        return <NationalMapTab wardId={wardId} />;
      case "services":
        return <ServicesTab wardId={wardId} />;
      case "profile":
        return <ProfileTab wardId={wardId} />;
      case "approvals":
        return <ApprovalQueueTab wardId={wardId} />;
      case "idcards":
        return <IdCardRequestsTab wardId={wardId} />;
      case "dashboard":
      default:
        return <DashboardTab wardId={wardId} />;
    }
  };

  const navigate = (id: string) => {
    setView(id as WardViewId);
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  };

  const handleToggleDesktopSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleOpenMobileDrawer = () => {
    setMobileOpen(true);
  };

  const closeMobileDrawer = () => {
    setMobileOpen(false);
  };

  const session = getCurrentSession();
  const unread = getNotifications(wardId).filter((n) => !n.read).length;

  const handleOpenSidebar = () => {
    if (isDesktop) {
      handleToggleDesktopSidebar();
    } else {
      handleOpenMobileDrawer();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 z-40">
          <WardSidebar
            active={view}
            onNavigate={navigate}
            wardId={wardId}
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
          active={view}
          onNavigate={navigate}
          wardId={wardId}
          onClose={closeMobileDrawer}
        />
      </Drawer>
      <div className={`flex min-w-0 flex-1 flex-col ${sidebarOpen ? "lg:pl-65" : "lg:pl-18"}`}>
        <WardTopbar
          sectionLabel={`Ward ${wardId.replace("ward-", "")}`}
          subtitle={WARD_VIEW_TITLES[view]}
          icon={VIEW_ICONS[view]}
          userName={session?.full_name ?? "Ward Admin"}
          userRole={session?.role ?? "Ward Admin"}
          unreadCount={unread}
          notificationWardId={wardId}
          sidebarOpen={sidebarOpen}
          onOpenSidebar={handleOpenSidebar}
          onGoProfile={() => navigate("profile")}
        />

        <main className="flex-1 px-4 pt-20 pb-6 sm:px-6 lg:px-8">{renderView(view)}</main>
      </div>
    </div>
  );
}