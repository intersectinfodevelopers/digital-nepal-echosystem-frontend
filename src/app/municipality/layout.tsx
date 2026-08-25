"use client";

import { useState } from "react";
import { Drawer, useMediaQuery } from "@mui/material";
import { BarChartOutlined, ChecklistOutlined, CardGiftcardOutlined, DashboardOutlined, HomeOutlined, PeopleOutlined, ReportProblemOutlined } from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import WardSidebar, { getNavItems } from "@/components/ward/WardSidebar";
import type { AdminNavSection } from "@/types/navigation";
import WardTopbar from "@/components/ward/WardTopbar";
import RouteGuard from "@/components/RouteGuard";
import { getCurrentSession } from "@/services/auth.service";
import { MapSelectionProvider } from "@/contexts/MapSelectionContext";

const MUNICIPALITY_NAV: AdminNavSection[] = [
  {
    type: "group",
    label: "Main",
    items: [
      { id: "/municipality/dashboard", label: "Dashboard", icon: <DashboardOutlined sx={{ fontSize: 20 }} /> },
      { id: "/municipality/analytics", label: "Analytics", icon: <BarChartOutlined sx={{ fontSize: 20 }} />, hasMapTree: true, mapHref: "/municipality/analytics" },
      { id: "/municipality/approvals", label: "Approvals", icon: <ChecklistOutlined sx={{ fontSize: 20 }} /> },
      { id: "/municipality/conflicts", label: "Conflicts", icon: <ReportProblemOutlined sx={{ fontSize: 20 }} /> },
      { id: "/municipality/benefits", label: "Benefits", icon: <CardGiftcardOutlined sx={{ fontSize: 20 }} /> },
      { id: "/municipality/reports", label: "Reports", icon: <BarChartOutlined sx={{ fontSize: 20 }} /> },
      { id: "/municipality/ward-admin", label: "Ward Admins", icon: <PeopleOutlined sx={{ fontSize: 20 }} /> },
    ],
  },
];

function getActiveView(pathname: string) {
  if (pathname.startsWith("/municipality/analytics")) return "/municipality/analytics";
  if (pathname.startsWith("/municipality/approvals")) return "/municipality/approvals";
  if (pathname.startsWith("/municipality/conflicts")) return "/municipality/conflicts";
  if (pathname.startsWith("/municipality/benefits")) return "/municipality/benefits";
  if (pathname.startsWith("/municipality/reports")) return "/municipality/reports";
  if (pathname.startsWith("/municipality/ward-admin")) return "/municipality/ward-admin";
  return "/municipality/dashboard";
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const session = getCurrentSession();
  const activeItem = getActiveView(pathname);

  const handleNavigate = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  const handleToggleDesktopSidebar = () => setSidebarOpen((prev) => !prev);
  const handleOpenSidebar = () => {
    if (isDesktop) {
      handleToggleDesktopSidebar();
    } else {
      setMobileOpen(true);
    }
  };

  const activeLabel = getNavItems(MUNICIPALITY_NAV).find((item) => item.id === activeItem)?.label ?? "Dashboard";

  return (
    <MapSelectionProvider>
      <RouteGuard requiredRole="LOCAL_BODY_ADMIN">
        <div className="flex min-h-screen bg-[#f5f7fb]">
        <div className="hidden lg:block">
          <div className="fixed inset-y-0 left-0 z-40">
            <WardSidebar
              active={activeItem}
              onNavigate={handleNavigate}
              navSections={MUNICIPALITY_NAV}
              headerTitle="Local Government Office"
              headerSubtitle="Kummayak Rural Municipality"
              entityMeta="Local Government Administration"
              collapsed={!sidebarOpen}
            />
          </div>
        </div>

        <Drawer
          open={mobileOpen && !isDesktop}
          onClose={() => setMobileOpen(false)}
          slotProps={{ paper: { sx: { borderRadius: 0, width: 260 } } }}
        >
          <WardSidebar
            active={activeItem}
            onNavigate={handleNavigate}
            navSections={MUNICIPALITY_NAV}
            headerTitle="Local Government Office"
            headerSubtitle="Kummayak Rural Municipality"
            entityMeta="Local Government Administration"
            onClose={() => setMobileOpen(false)}
          />
        </Drawer>

        <div className={`flex min-w-0 flex-1 flex-col ${sidebarOpen ? "lg:pl-65" : "lg:pl-18"}`}>
          <WardTopbar
            sectionLabel="Local Government"
            subtitle={activeLabel}
            icon={<HomeOutlined sx={{ fontSize: 20 }} />}
            userName={session?.full_name ?? "Local Body Admin"}
            userRole={session?.role ?? "Local Government Admin"}
            sidebarOpen={sidebarOpen}
            onOpenSidebar={handleOpenSidebar}
            onGoProfile={() => router.push("/municipality/dashboard")}
          />

          <main className="flex-1 px-4 pt-6 pb-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        </div>
      </RouteGuard>
    </MapSelectionProvider>
  );
}
