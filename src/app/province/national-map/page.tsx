"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/Map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function NationalMapPage() {
  return (
    <div className="h-screen w-full bg-gray-100 p-4">
      <div className="h-full w-full overflow-hidden rounded-xl bg-white">
        <LeafletMap
          center={[28.3949, 84.124]}
          zoom={7}
          height="100%"
          minimumLevel="country"
        />
      </div>
    </div>
  );
}
