"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Citizen } from "@/types/citizen";
import type { MapMarker } from "@/components/Map";
import usersData from "../../../../data/users.json";
import citizensData from "../../../../data/citizens.json";

type UserJson = {
  id: string;
  full_name: string;
  role: string;
  lat?: number;
  lng?: number;
};

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Page() {
  const markers = useMemo<MapMarker[]>(() => {
    const userMarkers: MapMarker[] = (usersData as UserJson[])
      .filter((u) => u.lat && u.lng)
      .map((u) => ({
        lat: u.lat!,
        lng: u.lng!,
        label: u.full_name,
        description: u.role,
      }));

    const citizenMarkers: MapMarker[] = (citizensData as Citizen[])
      .filter((c) => c.latitude && c.longitude)
      .map((c) => ({
        lat: c.latitude!,
        lng: c.longitude!,
        label: c.name_en,
        description: `${c.tole}, Ward ${c.ward_id}`,
      }));

    return [...userMarkers, ...citizenMarkers];
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">National Map</h1>
      <p className="text-gray-600">
        {markers.length} locations mapped across Nepal
      </p>
      <Map center={[27.7172, 85.324]} zoom={7} markers={markers} height="600px" />
    </div>
  );
}
