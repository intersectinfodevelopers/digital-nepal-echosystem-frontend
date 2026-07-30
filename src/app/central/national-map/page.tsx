"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/Map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-[#FAFAFA] rounded-2xl flex items-center justify-center border border-gray-200 animate-pulse">
      <p className="text-sm font-semibold text-gray-500">
        Loading GIS Engine...
      </p>
    </div>
  ),
});

export default function NationalMapPage() {
  return (
    <main className="space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-bold">National Map</h1>
        <p className="text-gray-600">Province-level overview.</p>
      </header>

      <LeafletMap center={[28.3949, 84.124]} zoom={7} height="600px" />
    </main>
  );
}
