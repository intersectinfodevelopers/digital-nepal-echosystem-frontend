import React from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { MapSelectionProvider } from '@/contexts/MapSelectionContext';

export default function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MapSelectionProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Central Sidebar using variant="central" */}
        <Sidebar variant="central" />

        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </MapSelectionProvider>
  );
}