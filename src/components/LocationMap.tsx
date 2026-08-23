"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const NEPAL_CENTER: [number, number] = [28.25, 84.124];
const NEPAL_ZOOM = 6;
const PIN_ZOOM = 15;

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 1C8.6 1 1 8.6 1 18c0 12 17 23 17 23s17-11 17-23C35 8.6 27.4 1 18 1Z" fill="#0E3A8A" stroke="#FFFFFF" stroke-width="2"/>
    <circle cx="18" cy="18" r="7" fill="#FFFFFF"/>
  </svg>`,
  iconSize: [36, 42],
  iconAnchor: [18, 41],
  popupAnchor: [0, -40],
});

type LocationMapProps = {
  latitude: string;
  longitude: string;
  accuracy: number | null;
  interactive?: boolean;
  onSelect?: (lat: number, lng: number) => void;
};

export function LocationMap({
  latitude,
  longitude,
  accuracy,
  interactive = true,
  onSelect,
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  const focusRef = useRef<string | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: NEPAL_CENTER,
      zoom: NEPAL_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (event) => {
      if (interactive) {
        onSelectRef.current?.(event.latlng.lat, event.latlng.lng);
      }
    });

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    layer.clearLayers();

    if (!hasCoords) {
      focusRef.current = null;
      map.setView(NEPAL_CENTER, NEPAL_ZOOM);
      return;
    }

    const point: [number, number] = [lat, lng];
    const key = `${lat.toFixed(6)}:${lng.toFixed(6)}`;

    if (accuracy && accuracy > 0) {
      L.circle(point, {
        radius: accuracy,
        color: "#E84060",
        fillColor: "rgba(255, 70, 100, 0.20)",
        fillOpacity: 1,
        weight: 1.5,
        opacity: 0.8,
        interactive: false,
      }).addTo(layer);
    }

    L.marker(point, { icon: pinIcon }).addTo(layer);

    if (focusRef.current !== key) {
      focusRef.current = key;
      const targetZoom = Math.max(map.getZoom(), PIN_ZOOM);
      map.flyTo(point, targetZoom, { duration: 0.6 });
    }
  }, [latitude, longitude, accuracy]);

  return (
    <div className="relative mt-4 h-[280px] overflow-hidden rounded-[10px] border border-[#D5DAE1]">
      <div ref={containerRef} className="h-full w-full" />
      {interactive && (
        <span className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-full bg-white/90 px-3 py-1.5 font-poppins text-[11px] font-semibold text-[#0E3A8A] shadow-sm">
          Click on the map to set the residence location
        </span>
      )}
    </div>
  );
}