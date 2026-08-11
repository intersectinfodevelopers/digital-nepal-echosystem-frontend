"use client";

import WardRouteGuard from "../../components/ward/WardRouteGuard";
import WardShell from "../../components/ward/WardShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <WardRouteGuard>
        <WardShell>{children}</WardShell>
      </WardRouteGuard>
    </div>
  );
}
