"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { GpsCoordinates, Citizen } from "@/types/citizen";
import type { MapMarker } from "@/components/Map";
import { SectionCard, FormRow, InputField } from "@/components/ui";
import citizensData from "../../data/citizens.json";

interface NearbyPlace {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address?: string;
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radius: number = 200,
): NearbyPlace[] {
  return (citizensData as Citizen[])
    .filter((c) => c.latitude && c.longitude)
    .map((c) => ({
      id: c.id,
      name: c.name_en,
      type: "citizen",
      lat: c.latitude!,
      lng: c.longitude!,
      address: c.tole,
    }))
    .filter((p) => haversineDistance(lat, lng, p.lat, p.lng) <= radius);
}

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

type GpsStepProps = {
  gps: GpsCoordinates;
  onChange: <K extends keyof GpsCoordinates>(
    key: K,
    value: GpsCoordinates[K],
  ) => void;
};

export function GpsStep({ gps, onChange }: GpsStepProps) {
  const lat = parseFloat(gps.latitude);
  const lng = parseFloat(gps.longitude);
  const hasValidCoords = !isNaN(lat) && !isNaN(lng);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasValidCoords) {
      setNearbyPlaces([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const places = fetchNearbyPlaces(lat, lng);
    setNearbyPlaces(places);
    setLoading(false);
  }, [lat, lng, hasValidCoords]);

  function handleMapClick(latClick: number, lngClick: number) {
    onChange("latitude", latClick.toFixed(6));
    onChange("longitude", lngClick.toFixed(6));
  }

  const handleSelectPlace = useCallback(
    (place: NearbyPlace) => {
      onChange("place_name", place.name);
    },
    [onChange],
  );

  const markers: MapMarker[] = hasValidCoords
    ? [
        { lat, lng, label: "Selected Location", type: "selected" },
        ...nearbyPlaces.map((p) => ({
          lat: p.lat,
          lng: p.lng,
          label: p.name,
          description: p.type,
          type: "place" as const,
        })),
      ]
    : [];

  return (
    <div>
      <SectionCard
        title="GPS Coordinates"
        description="Enter the geographic coordinates of the citizen's residence. Click the map to set coordinates."
      >
        <FormRow>
          <InputField
            label="Latitude"
            value={gps.latitude}
            onChange={(v) => onChange("latitude", v)}
            placeholder="e.g. 27.7172"
            required
          />
          <InputField
            label="Longitude"
            value={gps.longitude}
            onChange={(v) => onChange("longitude", v)}
            placeholder="e.g. 85.3240"
            required
          />
        </FormRow>

        {gps.place_name && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-xs text-emerald-600 font-medium">
              SELECTED PLACE
            </span>
            <p className="text-sm text-emerald-800 font-semibold mt-0.5">
              {gps.place_name}
            </p>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Map Preview
          </label>
          <div className="h-72 bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
            <Map
              center={hasValidCoords ? [lat, lng] : undefined}
              zoom={17}
              markers={markers}
              height="100%"
              onClick={handleMapClick}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {loading
              ? "Searching nearby places..."
              : `Click on the map to set coordinates. ${
                  nearbyPlaces.length > 0
                    ? `${nearbyPlaces.length} nearby place(s) found.`
                    : ""
                }`}
          </p>
        </div>

        {nearbyPlaces.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nearby Places (click to select)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {nearbyPlaces.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 ${
                    gps.place_name === place.name
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <span className="font-medium text-gray-900">
                    {place.name}
                  </span>
                  <span className="ml-2 text-xs uppercase text-gray-400">
                    {place.type}
                  </span>
                  {place.address && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {place.address}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
