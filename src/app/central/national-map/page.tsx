"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useMapSelection } from "@/contexts/MapSelectionContext";

const LeafletMap = dynamic(() => import("@/components/Map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#FAFAFA] rounded-2xl flex items-center justify-center border border-gray-200 animate-pulse">
      <p className="text-sm font-semibold text-gray-500">
        Loading GIS Engine...
      </p>
    </div>
  ),
});

export default function NationalMapPage() {
  const { resetToCountry } = useMapSelection();

  useEffect(() => {
    try {
      resetToCountry();
    } catch {
      // ignore
    }
  }, [resetToCountry]);

  return (
    <main className="h-full w-full">
      <LeafletMap center={[28.3949, 84.124]} zoom={7} height="100%" />
    </main>
  );
}
