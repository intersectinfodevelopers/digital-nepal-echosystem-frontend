"use client";

import dynamic from "next/dynamic";

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  totalCitizens: number;
  totalMunicipalities: number;
  topEmploymentCategory: string;
}

export interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: MapMarker[];
  height?: string;
  showResetControl?: boolean;
}

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-[#FAFAFA] rounded-2xl flex items-center justify-center border border-gray-200 animate-pulse">
      <p className="text-sm font-semibold text-gray-500">
        Loading GIS Engine...
      </p>
    </div>
  ),
});

export default LeafletMap;
