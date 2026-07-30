"use client";

import React, { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import type { MapProps } from "./index";

// Color palette matching standard province maps
const PROVINCE_COLORS: Record<string, { fill: string; border: string }> = {
  "prov-1": { fill: "#FFC1C1", border: "#E53E3E" }, // Koshi (Pink / Red)
  "1": { fill: "#FFC1C1", border: "#E53E3E" },
  "prov-2": { fill: "#E2D8D5", border: "#8D6E63" }, // Madhesh (Greyish Brown)
  "2": { fill: "#E2D8D5", border: "#8D6E63" },
  "prov-3": { fill: "#CBE2F7", border: "#3182CE" }, // Bagmati (Blue)
  "3": { fill: "#CBE2F7", border: "#3182CE" },
  "prov-4": { fill: "#FFE3C5", border: "#DD6B20" }, // Gandaki (Orange)
  "4": { fill: "#FFE3C5", border: "#DD6B20" },
  "prov-5": { fill: "#E9D8FD", border: "#805AD5" }, // Lumbini (Purple)
  "5": { fill: "#E9D8FD", border: "#805AD5" },
  "prov-6": { fill: "#C6F6D5", border: "#38A169" }, // Karnali (Green)
  "6": { fill: "#C6F6D5", border: "#38A169" },
  "prov-7": { fill: "#FCE7F3", border: "#D53F8C" }, // Sudurpashchim (Magenta)
  "7": { fill: "#FCE7F3", border: "#D53F8C" },
};

type MapLevel = "country" | "province" | "district";

type MapSelection = {
  level: MapLevel;
  provinceId: string | null;
  provinceLabel: string | null;
  districtName: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function resolveProvinceKey(properties: Record<string, unknown> | undefined) {
  const rawProvinceKey =
    properties?.id ??
    properties?.Province ??
    properties?.province ??
    properties?.PROVINCE ??
    properties?.FIRST_PROV;

  if (rawProvinceKey === null || rawProvinceKey === undefined) {
    return undefined;
  }

  return String(rawProvinceKey).trim().toLowerCase();
}

function resolveProvinceId(properties: Record<string, unknown> | undefined) {
  const rawProvinceId =
    properties?.id ??
    properties?.Province ??
    properties?.PROVINCE ??
    properties?.province_id ??
    properties?.province;

  if (rawProvinceId === null || rawProvinceId === undefined) {
    return undefined;
  }

  return String(rawProvinceId).trim();
}

function resolveDistrictName(properties: Record<string, unknown> | undefined) {
  return (
    stringValue(properties?.TARGET) ||
    stringValue(properties?.DISTRICT) ||
    stringValue(properties?.FIRST_DIST) ||
    stringValue(properties?.district) ||
    stringValue(properties?.name)
  );
}

function resolveProvinceLabel(properties: Record<string, unknown> | undefined) {
  return (
    stringValue(properties?.name) ||
    stringValue(properties?.name_en) ||
    stringValue(properties?.PROVINCE_NAME) ||
    stringValue(properties?.province_name) ||
    stringValue(properties?.DISTRICT) ||
    stringValue(properties?.TARGET)
  );
}

function resolveLocalBodyLabel(
  properties: Record<string, unknown> | undefined,
) {
  return (
    stringValue(properties?.FIRST_GaPa) ||
    stringValue(properties?.FIRST_GAPA) ||
    stringValue(properties?.FIRST_Type) ||
    stringValue(properties?.GNP) ||
    stringValue(properties?.name) ||
    stringValue(properties?.district)
  );
}

function geoJsonUrlForSelection(selection: MapSelection) {
  if (selection.level === "country") {
    return "/geojson/nepal-provinces.json";
  }

  if (selection.level === "province" && selection.provinceId) {
    return `/geojson/provinces/prov-${selection.provinceId}.json`;
  }

  if (selection.level === "district" && selection.districtName) {
    return `/geojson/local-bodies/${slugify(selection.districtName)}.json`;
  }

  return "/geojson/nepal-provinces.json";
}

function FitGeoJsonBounds({ data }: { data: any }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;

    const bounds = L.geoJSON(data).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [data, map]);

  return null;
}

export default function LeafletMap({
  center = [28.3949, 84.124],
  zoom = 7,
  height = "600px",
}: MapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [selection, setSelection] = useState<MapSelection>({
    level: "country",
    provinceId: null,
    provinceLabel: null,
    districtName: null,
  });

  const selectionLabel = useMemo(() => {
    if (selection.level === "district") {
      return selection.districtName || "District view";
    }

    if (selection.level === "province") {
      return selection.provinceLabel || "Province view";
    }

    return "Nepal";
  }, [selection]);

  useEffect(() => {
    const url = geoJsonUrlForSelection(selection);
    let cancelled = false;

    setGeoJsonData(null);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("GeoJSON file missing or unreadable");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setGeoJsonData(data);
        }
      })
      .catch((err) => console.error("Error loading GeoJSON data:", err));
    return () => {
      cancelled = true;
    };
  }, [selection]);

  const getDistrictStyle = (feature: any) => {
    const featureKey =
      selection.level === "country"
        ? resolveProvinceKey(feature?.properties)
        : selection.level === "province"
          ? resolveDistrictName(feature?.properties)
          : resolveLocalBodyLabel(feature?.properties);

    const provinceKey = resolveProvinceKey(feature?.properties);
    const hash = (input: string) =>
      Array.from(input).reduce((total, char) => total + char.charCodeAt(0), 0);

    const paletteForLevel = (() => {
      if (selection.level === "country") {
        return (
          (provinceKey && PROVINCE_COLORS[provinceKey]) || {
            fill: "#E2E8F0",
            border: "#64748B",
          }
        );
      }

      const hue = hash(featureKey || "") % 360;
      return {
        fill: `hsl(${hue} 70% 78%)`,
        border: `hsl(${hue} 65% 42%)`,
      };
    })();

    return {
      fillColor: paletteForLevel.fill,
      weight: selection.level === "country" ? 1.2 : 1,
      opacity: 1,
      color: paletteForLevel.border,
      fillOpacity: selection.level === "country" ? 0.85 : 0.45,
    };
  };

  const onEachDistrict = (feature: any, layer: any) => {
    const provinceId = resolveProvinceId(feature?.properties);
    const provinceLabel = resolveProvinceLabel(feature?.properties);
    const districtName = resolveDistrictName(feature?.properties) || "District";
    const localBodyName =
      resolveLocalBodyLabel(feature?.properties) || "Local body";

    const tooltipLabel =
      selection.level === "country"
        ? provinceLabel || `Province ${provinceId || ""}`
        : selection.level === "province"
          ? districtName
          : localBodyName;

    layer.bindTooltip(tooltipLabel, { sticky: true });

    if (selection.level === "country" && provinceId) {
      layer.on({
        click: () => {
          setSelection({
            level: "province",
            provinceId,
            provinceLabel: provinceLabel || `Province ${provinceId}`,
            districtName: null,
          });
        },
      });
    }

    if (selection.level === "province" && districtName) {
      layer.on({
        click: () => {
          setSelection((current) => ({
            level: "district",
            provinceId: current.provinceId,
            provinceLabel: current.provinceLabel,
            districtName,
          }));
        },
      });
    }

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 1, weight: 2.2 });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(getDistrictStyle(feature));
      },
    });
  };

  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden bg-[#FAFAFA] border border-gray-200 shadow-sm relative z-0 flex items-center justify-center"
    >
      {selection.level !== "country" && (
        <button
          type="button"
          onClick={() =>
            setSelection((current) =>
              current.level === "district"
                ? {
                    level: "province",
                    provinceId: current.provinceId,
                    provinceLabel: current.provinceLabel,
                    districtName: null,
                  }
                : {
                    level: "country",
                    provinceId: null,
                    provinceLabel: null,
                    districtName: null,
                  },
            )
          }
          className="absolute left-3 top-3 z-[1000] rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          {selection.level === "district"
            ? "Back to province"
            : "Back to Nepal"}
        </button>
      )}

      <div className="absolute right-3 top-3 z-[1000] rounded-full bg-white/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm ring-1 ring-slate-200">
        {selectionLabel}
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        attributionControl={false}
        className="w-full h-full bg-[#FAFAFA]"
      >
        <FitGeoJsonBounds data={geoJsonData} />

        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={getDistrictStyle}
            onEachFeature={onEachDistrict}
          />
        )}
      </MapContainer>
    </div>
  );
}
