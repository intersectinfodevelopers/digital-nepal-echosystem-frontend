import React from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Sidebar from "@/components/ui/Sidebar";
import { MapSelectionProvider } from "@/contexts/MapSelectionContext";

export default function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MapSelectionProvider>
      <div className="flex h-dvh overflow-hidden bg-gray-50">
        {/* Central Sidebar using variant="central" */}
        <Sidebar variant="central" />

        {/* Main Page Content */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur">
            <Breadcrumbs />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>
        </main>
      </div>
    </MapSelectionProvider>
  );
}
