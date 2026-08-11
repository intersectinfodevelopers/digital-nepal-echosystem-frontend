"use client";

import { ReactNode, useState } from "react";
import { Drawer, useMediaQuery } from "@mui/material";
import { AccountBalanceOutlined, BarChartOutlined, FlagOutlined, FormatListBulletedOutlined, PublicOutlined } from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import WardSidebar, { getNavItems, type AdminNavSection } from "@/components/ward/WardSidebar";
import WardTopbar from "@/components/ward/WardTopbar";
import RouteGuard from "@/components/RouteGuard";
import { getCurrentSession } from "@/services/auth.service";
import { MapSelectionProvider } from "@/contexts/MapSelectionContext";

const PROVINCE_NAV: AdminNavSection[] = [
  {
    type: "group",
    label: "Main",
    items: [
      { id: "/province/dashboard", label: "Dashboard", icon: <AccountBalanceOutlined sx={{ fontSize: 20 }} /> },
      { id: "/province/municipalities", label: "Municipalities", icon: <FormatListBulletedOutlined sx={{ fontSize: 20 }} /> },
      { id: "/province/analytics", label: "Analytics", icon: <BarChartOutlined sx={{ fontSize: 20 }} /> },
      { id: "/province/reports", label: "Reports", icon: <FlagOutlined sx={{ fontSize: 20 }} /> },
    ],
  },
];

function getActiveView(pathname: string) {
  if (pathname.startsWith("/province/municipalities")) return "/province/municipalities";
  if (pathname.startsWith("/province/analytics")) return "/province/analytics";
  if (pathname.startsWith("/province/reports")) return "/province/reports";
  return "/province/dashboard";
}

interface ProvinceLayoutProps {
  children: ReactNode;
}

export default function ProvinceLayout({ children }: ProvinceLayoutProps) {
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

  const provinceName = session?.province_name ?? "Province";
  const activeLabel = getNavItems(PROVINCE_NAV).find((item) => item.id === activeItem)?.label ?? "Dashboard";

  return (
    <MapSelectionProvider>
      <RouteGuard requiredRole="PROVINCE_ADMIN">
        <div className="flex min-h-screen bg-[#f5f7fb]">
          <div className="hidden lg:block">
            <div className="fixed inset-y-0 left-0 z-40">
              <WardSidebar
                active={activeItem}
                onNavigate={handleNavigate}
                navSections={PROVINCE_NAV}
                headerTitle="Province Administration"
                headerSubtitle={provinceName}
                entityMeta="Province Government"
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
              navSections={PROVINCE_NAV}
              headerTitle="Province Administration"
              headerSubtitle={provinceName}
              entityMeta="Province Government"
              onClose={() => setMobileOpen(false)}
            />
          </Drawer>

          <div className={`flex min-w-0 flex-1 flex-col ${sidebarOpen ? "lg:pl-65" : "lg:pl-18"}`}>
            <WardTopbar
              sectionLabel="Province Portal"
              subtitle={activeLabel}
              icon={<PublicOutlined sx={{ fontSize: 20 }} />}
              userName={session?.full_name ?? "Province Admin"}
              userRole={session?.role ?? "Province Authority"}
              sidebarOpen={sidebarOpen}
              onOpenSidebar={handleOpenSidebar}
              onGoProfile={() => router.push("/province/dashboard")}
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
