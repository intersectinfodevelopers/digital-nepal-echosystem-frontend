import type { ReactNode } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar items={[]} />

        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar />

          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}