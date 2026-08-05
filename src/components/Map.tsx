"use client";

import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  description: string;
}

interface MapProps {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  height: string;
}

const markerIcon = divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;background:#C01F38;border:2.5px solid #ffffff;border-radius:9999px;box-shadow:0 2px 8px rgba(15,61,145,0.45);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8],
});

export default function Map({ center, zoom, markers, height }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height, width: "100%", borderRadius: "16px", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker
          key={`${marker.lat}-${marker.lng}-${marker.label}`}
          position={[marker.lat, marker.lng]}
          icon={markerIcon}
        >
          <Popup>
            <strong>{marker.label}</strong>
            <br />
            <span>{marker.description}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
