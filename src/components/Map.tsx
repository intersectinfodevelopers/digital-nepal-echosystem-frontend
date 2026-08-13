"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapMarker, MapProps } from "@/types/map";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const placeIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
  className: "place-marker",
});

export type { MapMarker };

function createPopup(marker: MapMarker) {
  const popup = document.createElement("div");

  if (marker.label) {
    const title = document.createElement("strong");
    title.textContent = marker.label;
    popup.appendChild(title);
  }

  const details = [
    marker.description,
    marker.totalCitizens !== undefined
      ? `Total citizens: ${marker.totalCitizens.toLocaleString()}`
      : undefined,
    marker.totalMunicipalities !== undefined
      ? `Total municipalities: ${marker.totalMunicipalities.toLocaleString()}`
      : undefined,
    marker.topEmploymentCategory
      ? `Top employment: ${marker.topEmploymentCategory}`
      : undefined,
  ];

  details.forEach((text) => {
    if (text) {
      const line = document.createElement("div");
      line.textContent = text;
      popup.appendChild(line);
    }
  });

  return popup;
}

export default function Map({
  center = [26.958, 87.281],
  zoom = 13,
  markers = [],
  height = "400px",
  showResetControl = false,
  onClick,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const onClickRef = useRef(onClick);
  const initialView = useRef({ center, zoom });

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current).setView(
      initialView.current.center,
      initialView.current.zoom,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (event) => {
      onClickRef.current?.(event.latlng.lat, event.latlng.lng);
    });

    mapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    mapRef.current?.setView(center, zoom);
  }, [center, zoom]);

  useEffect(() => {
    const markerLayer = markerLayerRef.current;
    if (!markerLayer) return;

    markerLayer.clearLayers();

    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: marker.type === "place" ? placeIcon : defaultIcon,
      });

      if (marker.label) leafletMarker.bindPopup(createPopup(marker));
      leafletMarker.addTo(markerLayer);
    });
  }, [markers]);

  function resetView() {
    mapRef.current?.setView(center, zoom);
  }

  return (
    <div className="relative" style={{ height, width: "100%" }}>
      <div ref={containerRef} className="h-full w-full rounded-lg" />
      {showResetControl && (
        <button
          type="button"
          onClick={resetView}
          className="absolute right-3 top-3 z-[1000] rounded bg-white px-3 py-2 text-sm shadow"
        >
          Reset view
        </button>
      )}
    </div>
  );
}
