import Sidebar, { SidebarItem } from "@/components/ui/Sidebar";
import { MapSelectionProvider } from "@/contexts/MapSelectionContext";

const PROVINCE_NAV_ITEMS: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/province/dashboard",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },

  {
    label: "Municipalities",
    href: "/province/municipalities",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },

  {
    label: "Analytics",
    href: "/province/analytics",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m2 0h2a2 2 0 002-2v-3a2 2 0 00-2-2h-3m-14 0H3a2 2 0 00-2 2v3a2 2 0 002 2h2m0 0h2a2 2 0 002-2v-3a2 2 0 00-2-2H3z"
        />
      </svg>
    ),
  },

  {
    label: "Reports",
    href: "/province/reports",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707l.293.293V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MapSelectionProvider>
      <div className="flex min-h-screen">
        <Sidebar
          items={PROVINCE_NAV_ITEMS}
          variant="province"
          userInfo={{
            name: "Province Admin",
            role: "Province Authority",
          }}
        />

        <main className="min-w-0 flex-1 bg-background">{children}</main>
      </div>
    </MapSelectionProvider>
  );
}
