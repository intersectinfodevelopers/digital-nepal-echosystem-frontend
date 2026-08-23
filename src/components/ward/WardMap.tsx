"use client";

import dynamic from "next/dynamic";
import { getWardProfile } from "@/services/mockWardAdmin";
import {
  PROVINCE_HIERARCHY,
  getLocalBodies,
  normalizeDistrictKey,
  type LocalBody,
} from "@/constants/provinceHierarchy";

const LeafletMap = dynamic(() => import("@/components/Map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-gray-200 bg-[#FAFAFA]">
      <p className="text-sm font-semibold text-gray-500">
        Loading GIS Engine...
      </p>
    </div>
  ),
});

export interface WardMapContext {
  provinceId: string;
  provinceLabel: string;
  districtName: string;
  localBodyName: string;
  localBodyType: string | null;
}

/** Derives the map selection for a ward from its profile (province → district → local body). */
export function getWardMapContext(wardId: string): WardMapContext | null {
  const profile = getWardProfile(wardId);
  if (!profile) return null;

  const province = PROVINCE_HIERARCHY.find((p) =>
    profile.province.toLowerCase().includes(p.label.toLowerCase()),
  );
  if (!province) return null;

  const districtName = profile.district;
  const municipality = profile.municipality.trim();

  const matched = getLocalBodies(districtName).find((lb: LocalBody) => {
    const lbKey = normalizeDistrictKey(lb.name);
    const muniKey = normalizeDistrictKey(municipality);
    return (
      muniKey === lbKey ||
      muniKey.includes(lbKey) ||
      lbKey.includes(muniKey)
    );
  });

  return {
    provinceId: province.id,
    provinceLabel: province.label,
    districtName,
    localBodyName: matched?.name ?? municipality,
    localBodyType: matched?.type ?? null,
  };
}

interface WardMapProps {
  height?: string;
}

export default function WardMap({ height = "100%" }: WardMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ height }}>
      <LeafletMap height="100%" />
    </div>
  );
}