"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import L from "leaflet";
import { MapContainer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import type { MapProps } from "./index";
import { useMapSelection } from "@/contexts/MapSelectionContext";

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
  vectorTilesUrl,
}: MapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [manifest, setManifest] = useState<any>(null);
  const { selection, setSelection } = useMapSelection();

  const vectorLayerRef = useRef<any>(null);


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
    // If vector tiles are provided, skip per-selection GeoJSON fetches
    if (vectorTilesUrl) return;

    const resolveUrlFromManifest = () => {
      if (!manifest) return geoJsonUrlForSelection(selection);

      if (selection.level === "country") {
        return "/geojson/nepal-provinces.json";
      }

      if (selection.level === "province" && selection.provinceId) {
        // prefer manifest entry if present
        const candidate = manifest.provinces?.find((p: string) => p.includes(`prov-${selection.provinceId}.json`));
        return candidate ? `/${candidate.replace(/^\//,"")}` : `/geojson/provinces/prov-${selection.provinceId}.json`;
      }

      if (selection.level === "district" && selection.districtName) {
        // Normalize province id: manifest keys use `prov-<id>_districts`
        const provIdRaw = String(selection.provinceId || "").trim();
        const provBase = provIdRaw.toLowerCase().startsWith('prov-') ? provIdRaw.toLowerCase() : `prov-${provIdRaw}`;
        const provinceKey = `${provBase}_districts`;
        const list: string[] = manifest.districts?.[provinceKey] || [];

        const normalize = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        const targetNorm = normalize(selection.districtName || "");

        // try exact slug match first, then fuzzy normalize match
        let found = list.find((p) => {
          const name = (p.split('/').pop() || p).replace(/\.json$/i, '');
          return normalize(name) === targetNorm;
        });

        if (!found) {
          // fallback: try contains match (some filenames include extra tokens)
          found = list.find((p) => {
            const name = (p.split('/').pop() || p).replace(/\.json$/i, '');
            return normalize(name).includes(targetNorm) || targetNorm.includes(normalize(name));
          });
        }

        if (found) return `/${found.replace(/^\//, "")}`;
      }

      return geoJsonUrlForSelection(selection);
    };

    const url = resolveUrlFromManifest();
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

  // load manifest once on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/manifest.json')
      .then((r) => {
        if (!r.ok) throw new Error('manifest missing');
        return r.json();
      })
      .then((m) => {
        if (!cancelled) setManifest(m);
      })
      .catch(() => {})
      .finally(() => {});
    return () => { cancelled = true };
  }, []);

  // Nested component: add Vector Tile layer using Leaflet.VectorGrid
  function VectorTileLayer({ url }: { url: string }) {
    const map = useMap();

    useEffect(() => {
      if (!url) return;

      const Lany = (L as any);
      let script: HTMLScriptElement | null = null;
      let layer: any = null;

      const createLayer = () => {
        try {
          const vg = Lany.vectorGrid;
          if (!vg) return;

          layer = vg.protobuf(url, {
            interactive: true,
            vectorTileLayerStyles: {
              // default style for all tile layers
              default: (properties: any, zoom: number) => {
                const name = String(properties?.name || properties?.NAME || "");
                const hue = Array.from(name).reduce((s: number, c: string) => s + c.charCodeAt(0), 0) % 360;
                return {
                  fillColor: `hsl(${hue} 65% 78%)`,
                  color: `hsl(${hue} 60% 35%)`,
                  weight: 1,
                  fillOpacity: 0.45,
                };
              },
            },
            getFeatureId: (f: any) => f.properties && (f.properties.id || f.properties.ID || f.properties.name),
          });

          layer.on('click', (e: any) => {
            try {
              const prop = e?.layer?.properties || e?.feature?.properties || {};
              const districtName = prop.DISTRICT || prop.district || prop.name || prop.NAME;
              // basic behavior: center map on clicked point and update selection to district level
              if (e && e.latlng) map.panTo(e.latlng);
              setSelection((current) => ({
                level: 'district',
                provinceId: current.provinceId,
                provinceLabel: current.provinceLabel,
                districtName: String(districtName || '').trim(),
              }));
            } catch (err) {
              console.error('Vector tile click handler error', err);
            }
          });

          layer.addTo(map);
          vectorLayerRef.current = layer;
        } catch (err) {
          console.error('Failed to create vector grid layer', err);
        }
      };

      if (!Lany.vectorGrid) {
        script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet.vectorgrid@1.3.0/dist/Leaflet.VectorGrid.bundled.js';
        script.async = true;
        script.onload = () => createLayer();
        script.onerror = () => console.error('Failed to load Leaflet.VectorGrid script');
        document.body.appendChild(script);
      } else {
        createLayer();
      }

      return () => {
        try {
          if (layer && map && map.hasLayer(layer)) map.removeLayer(layer);
          vectorLayerRef.current = null;
          if (script && script.parentNode) script.parentNode.removeChild(script);
        } catch (err) {}
      };
    }, [map, url]);

    return null;
  }

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
        {vectorTilesUrl ? (
          <VectorTileLayer url={vectorTilesUrl} />
        ) : (
          <>
            <FitGeoJsonBounds data={geoJsonData} />

            {geoJsonData && (
              <GeoJSON
                data={geoJsonData}
                style={getDistrictStyle}
                onEachFeature={onEachDistrict}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
