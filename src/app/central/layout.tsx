"use client";

import { useState } from "react";
import { Drawer, useMediaQuery } from "@mui/material";
import {
  AccountBalanceOutlined,
  AnalyticsOutlined,
  DashboardOutlined,
  HistoryOutlined,
  MapOutlined,
  PersonOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import WardSidebar, {
  getNavItems,
  type AdminNavSection,
} from "@/components/ward/WardSidebar";
import WardTopbar from "@/components/ward/WardTopbar";
import RouteGuard from "@/components/RouteGuard";
import { getCurrentSession } from "@/services/auth.service";
import { MapSelectionProvider } from "@/contexts/MapSelectionContext";

const CENTRAL_NAV: AdminNavSection[] = [
  {
    type: "group",
    label: "Main",
    items: [
      {
        id: "/central/dashboard",
        label: "Dashboard",
        icon: <DashboardOutlined sx={{ fontSize: 20 }} />,
      },
      {
        id: "/central/analytics",
        label: "Analytics",
        icon: <AnalyticsOutlined sx={{ fontSize: 20 }} />,
      },
      {
        id: "/central/national-map",
        label: "National Map",
        icon: <MapOutlined sx={{ fontSize: 20 }} />,
        hasMapTree: true,
        mapHref: "/central/national-map",
      },
    ],
  },
  {
    type: "group",
    label: "Management",
    items: [
      {
        id: "/central/province-admins",
        label: "Province Admins",
        icon: <PersonOutlined sx={{ fontSize: 20 }} />,
      },
      {
        id: "/central/eligibility-rules",
        label: "Eligibility Rules",
        icon: <ReceiptLongOutlined sx={{ fontSize: 20 }} />,
      },
      {
        id: "/central/audit-log",
        label: "Audit Log",
        icon: <HistoryOutlined sx={{ fontSize: 20 }} />,
      },
      {
        id: "/central/policy-cards",
        label: "Policy Cards",
        icon: <ReceiptLongOutlined sx={{ fontSize: 20 }} />,
      },
    ],
  },
];

function getActiveView(pathname: string) {
  if (pathname.startsWith("/central/analytics")) return "/central/analytics";
  if (pathname.startsWith("/central/national-map"))
    return "/central/national-map";
  if (pathname.startsWith("/central/province-admins"))
    return "/central/province-admins";
  if (pathname.startsWith("/central/eligibility-rules"))
    return "/central/eligibility-rules";
  if (pathname.startsWith("/central/audit-log")) return "/central/audit-log";
  if (pathname.startsWith("/central/policy-cards"))
    return "/central/policy-cards";
  return "/central/dashboard";
}

export default function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const session = getCurrentSession();
  const activeItem = getActiveView(pathname);

  const activeLabel =
    getNavItems(CENTRAL_NAV).find((item) => item.id === activeItem)?.label ??
    "Dashboard";

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

  return (
    <MapSelectionProvider>
      <RouteGuard requiredRole="CENTRAL_ADMIN">
        <div className="flex min-h-screen bg-[#f5f7fb]">
          <div className="hidden lg:block">
            <div className="fixed inset-y-0 left-0 z-40">
              <WardSidebar
                active={activeItem}
                onNavigate={handleNavigate}
                navSections={CENTRAL_NAV}
                headerTitle="Central Administration"
                headerSubtitle="Digital Nepal Central Portal"
                entityMeta="Federal Coordination"
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
              navSections={CENTRAL_NAV}
              headerTitle="Central Administration"
              headerSubtitle="Digital Nepal Central Portal"
              entityMeta="Federal Coordination"
              onClose={() => setMobileOpen(false)}
            />
          </Drawer>

          <div
            className={`flex min-w-0 flex-1 flex-col ${sidebarOpen ? "lg:pl-65" : "lg:pl-18"}`}
          >
            <WardTopbar
              sectionLabel="Central Portal"
              subtitle={activeLabel}
              icon={<AccountBalanceOutlined sx={{ fontSize: 20 }} />}
              userName={session?.full_name ?? "Central Admin"}
              userRole={session?.role ?? "Central Authority"}
              sidebarOpen={sidebarOpen}
              onOpenSidebar={handleOpenSidebar}
              onGoProfile={() => router.push("/central/dashboard")}
            />

            <main className="flex-1 px-4 pt-20 pb-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </RouteGuard>
    </MapSelectionProvider>
  );
}
