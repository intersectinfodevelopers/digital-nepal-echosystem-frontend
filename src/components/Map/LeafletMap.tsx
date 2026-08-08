/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import L from "leaflet";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";

import type { MapProps } from "./index";
import { useMapSelection } from "@/contexts/MapSelectionContext";

// =====================
// Constants & Types
// =====================
const NEPAL_PROVINCES = "/geojson/nepal-provinces.json";
const MANIFEST_PATH = "/manifest.json";

const PROVINCE_COLORS: Record<string, { fill: string; border: string }> = {
  "prov-1": { fill: "#FFC1C1", border: "#E53E3E" },
  "1": { fill: "#FFC1C1", border: "#E53E3E" },
  "prov-2": { fill: "#E2D8D5", border: "#8D6E63" },
  "2": { fill: "#E2D8D5", border: "#8D6E63" },
  "prov-3": { fill: "#CBE2F7", border: "#3182CE" },
  "3": { fill: "#CBE2F7", border: "#3182CE" },
  "prov-4": { fill: "#FFE3C5", border: "#DD6B20" },
  "4": { fill: "#FFE3C5", border: "#DD6B20" },
  "prov-5": { fill: "#E9D8FD", border: "#805AD5" },
  "5": { fill: "#E9D8FD", border: "#805AD5" },
  "prov-6": { fill: "#C6F6D5", border: "#38A169" },
  "6": { fill: "#C6F6D5", border: "#38A169" },
  "prov-7": { fill: "#FCE7F3", border: "#D53F8C" },
  "7": { fill: "#FCE7F3", border: "#D53F8C" },
};

type MapLevel = "country" | "province" | "district" | "localBody";

type SelectionShape = {
  level: MapLevel;
  provinceId: string | null;
  provinceLabel: string | null;
  districtName: string | null;
  localBodyName: string | null;
  localBodyType: string | null;
};

// =====================
// String / Property Helpers
// =====================
const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const str = (v: unknown) =>
  v === null || v === undefined ? "" : String(v).trim();

const propGet = (
  props: Record<string, unknown> | undefined,
  ...keys: string[]
) => {
  if (!props) return undefined;
  for (const k of keys) {
    if (props[k] !== undefined && props[k] !== null) return props[k];
  }
  return undefined;
};

const resolveProvinceKey = (p?: Record<string, unknown>) =>
  (
    str(propGet(p, "id", "Province", "province", "PROVINCE", "FIRST_PROV")) ||
    undefined
  )?.toLowerCase();
const resolveProvinceId = (p?: Record<string, unknown>) => {
  const v = propGet(p, "id", "Province", "PROVINCE", "province_id", "province");
  return v === undefined ? undefined : str(v);
};
const resolveProvinceLabel = (p?: Record<string, unknown>) =>
  str(
    propGet(
      p,
      "name",
      "name_en",
      "PROVINCE_NAME",
      "province_name",
      "DISTRICT",
      "TARGET",
    ),
  );

// Vector tile layer component (placed at module scope so it's not recreated during render)
function VectorTileLayer({ url }: { url?: string }) {
  const map = useMap();
  const { setSelection } = useMapSelection();
  const localRef = React.useRef<any>(null);

  useEffect(() => {
    if (!url) return;
    const Lany = L as any;
    let layer: any = null;
    try {
      const vg = Lany.vectorGrid;
      if (!vg) {
        console.warn(
          "Leaflet.VectorGrid not available; skipping vector tiles.",
        );
        return;
      }
      layer = vg.protobuf(url, {
        interactive: true,
        vectorTileLayerStyles: {
          default: (props: any) => {
            const name = String(props?.name || props?.NAME || "");
            const hue =
              Array.from(name).reduce(
                (s: number, c: string) => s + c.charCodeAt(0),
                0,
              ) % 360;
            return {
              fillColor: `hsl(${hue} 65% 78%)`,
              color: `hsl(${hue} 60% 35%)`,
              weight: 1,
              fillOpacity: 0.45,
            };
          },
        },
        getFeatureId: (f: any) =>
          f?.properties &&
          (f.properties.id || f.properties.ID || f.properties.name),
      });

      layer.on("click", (e: any) => {
        try {
          const prop = e?.layer?.properties || e?.feature?.properties || {};
          const districtName =
            prop.DISTRICT || prop.district || prop.name || prop.NAME;
          if (e?.latlng) map.panTo(e.latlng);
          setSelection((cur: any) => ({
            level: "district",
            provinceId: cur.provinceId,
            provinceLabel: cur.provinceLabel,
            districtName: String(districtName || "").trim(),
            localBodyName: null,
            localBodyType: null,
          }));
        } catch (err) {
          console.error("Vector tile click error", err);
        }
      });

      layer.addTo(map);
      localRef.current = layer;
    } catch (err) {
      console.error("VectorTileLayer creation error", err);
    }

    return () => {
      try {
        if (localRef.current && map && map.hasLayer(localRef.current))
          map.removeLayer(localRef.current);
      } catch {}
      localRef.current = null;
    };
  }, [map, url, setSelection]);

  return null;
}
const resolveDistrictName = (p?: Record<string, unknown>) =>
  str(propGet(p, "TARGET", "DISTRICT", "FIRST_DIST", "district", "name"));
const resolveLocalBodyLabel = (p?: Record<string, unknown>) =>
  str(
    propGet(
      p,
      "FIRST_GaPa",
      "FIRST_GAPA",
      "FIRST_Type",
      "GNP",
      "name",
      "district",
    ),
  );

// URL / Manifest Helpers
const isSafeGeojsonPath = (raw?: string | null) => {
  if (!raw) return false;
  const s = String(raw).trim();
  if (/^https?:\/\//i.test(s)) return false;
  if (s.includes("..") || s.includes("\\")) return false;
  return (
    s.startsWith("/geojson/") ||
    s.startsWith("geojson/") ||
    s === MANIFEST_PATH ||
    s === MANIFEST_PATH.replace(/^\//, "")
  );
};

const defaultGeoFor = (sel: SelectionShape) => {
  if (sel.level === "country") return NEPAL_PROVINCES;
  if (sel.level === "province" && sel.provinceId)
    return `/geojson/provinces/prov-${sel.provinceId}.json`;
  if (
    (sel.level === "district" || sel.level === "localBody") &&
    sel.districtName
  )
    return `/geojson/local-bodies/${slugify(sel.districtName)}.json`;
  return NEPAL_PROVINCES;
};

const findDistrictManifestEntry = (manifest: any, sel: SelectionShape) => {
  if (!manifest || !sel.districtName) return undefined;
  const rawProv = str(sel.provinceId || "");
  const provBase = rawProv.toLowerCase().startsWith("prov-")
    ? rawProv.toLowerCase()
    : `prov-${rawProv}`;
  const key = `${provBase}_districts`;
  const list: string[] = manifest?.districts?.[key] || [];
  if (!Array.isArray(list) || list.length === 0) return undefined;

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const target = normalize(sel.districtName || "");

  let found = list.find(
    (p) =>
      normalize((p.split("/").pop() || "").replace(/\.json$/i, "")) === target,
  );
  if (found) return `/${found.replace(/^\//, "")}`;

  found = list.find((p) => {
    const name = (p.split("/").pop() || "").replace(/\.json$/i, "");
    const n = normalize(name);
    return n.includes(target) || target.includes(n);
  });
  return found ? `/${found.replace(/^\//, "")}` : undefined;
};

const resolveGeoJsonUrl = (manifest: any, sel: SelectionShape) => {
  if (!manifest) return defaultGeoFor(sel);
  if (sel.level === "country") return NEPAL_PROVINCES;
  if (sel.level === "province" && sel.provinceId) {
    const candidate = (manifest.provinces || []).find((p: string) =>
      p.includes(`prov-${sel.provinceId}.json`),
    );
    return candidate
      ? `/${candidate.replace(/^\//, "")}`
      : `/geojson/provinces/prov-${sel.provinceId}.json`;
  }
  if (sel.level === "district") {
    const fromManifest = findDistrictManifestEntry(manifest, sel);
    if (fromManifest) return fromManifest;
  }
  return defaultGeoFor(sel);
};

// Map bounds helper (react-leaflet hook)
function FitGeoJsonBounds({ data }: { data: any }) {
  const map = useMap();
  useEffect(() => {
    if (!data) return;
    try {
      const b = L.geoJSON(data).getBounds();
      if (b.isValid()) map.fitBounds(b, { padding: [24, 24] });
    } catch {
      // ignore malformed geojson
    }
  }, [data, map]);
  return null;
}

// Component
export default function LeafletMap({
  center = [28.3949, 84.124],
  zoom = 7,
  height = "600px",
  vectorTilesUrl,
}: MapProps) {
  const { selection, setSelection } = useMapSelection();
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [manifest, setManifest] = useState<any>(null);
  const lastTimedOutRef = useRef<string | null>(null);

  const normalizeKey = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, "");

  const selectionLabel = useMemo(() => {
    if (selection.level === "localBody")
      return selection.localBodyName || "Local body view";
    if (selection.level === "district")
      return selection.districtName || "District view";
    if (selection.level === "province")
      return selection.provinceLabel || "Province view";
    return "Nepal";
  }, [
    selection.level,
    selection.districtName,
    selection.localBodyName,
    selection.provinceLabel,
  ]);

  // Manifest loader (once)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(MANIFEST_PATH);
        if (!res.ok) return;
        const m = await res.json();
        if (!mounted) return;
        const safe: any = {};
        if (m && typeof m === "object") {
          if (Array.isArray(m.provinces))
            safe.provinces = m.provinces.filter(
              (x: any) => typeof x === "string",
            );
          if (m.districts && typeof m.districts === "object") {
            safe.districts = {};
            for (const k of Object.keys(m.districts)) {
              const v = m.districts[k];
              if (Array.isArray(v))
                safe.districts[k] = v.filter(
                  (it: any) => typeof it === "string",
                );
            }
          }
        }
        setManifest(safe);
      } catch {
        // manifest is optional, fail silently
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // GeoJSON loader (per-selection). Preserves AbortController + timeout + size check.
  // Dependencies: selection and manifest (manifest influences resolution)
  useEffect(() => {
    if (vectorTilesUrl) return; // vector tiles skip geojson loading

    let mounted = true;
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let timedOut = false;
    const debounceDelay = 250; // wait briefly for rapid selection changes
    const fetchTimeoutMs = 30_000; // increase timeout to 30s

    const load = async () => {
      setGeoJsonData(null);
      try {
        const url = resolveGeoJsonUrl(manifest, selection);
        const safeCheckPath = url.replace(/^\//, "");
        if (!isSafeGeojsonPath(safeCheckPath) && url !== NEPAL_PROVINCES) {
          console.error("Rejected unsafe geojson path:", url);
          return;
        }

        timeoutId = setTimeout(() => {
          timedOut = true;
          try {
            controller.abort();
          } catch {}
        }, fetchTimeoutMs);

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("GeoJSON file missing or unreadable");
        const cl = res.headers.get("content-length");
        if (cl && Number(cl) > 10_000_000) throw new Error("GeoJSON too large");
        const data = await res.json();
        if (!mounted) return;
        setGeoJsonData(data);
      } catch (err: any) {
        if (
          err?.name === "AbortError" ||
          err?.message === "The user aborted a request."
        ) {
          // Only warn when the fetch actually timed out, and avoid repeating the same message
          if (timedOut) {
            const url = resolveGeoJsonUrl(manifest, selection);
            if (lastTimedOutRef.current !== url) {
              console.warn("GeoJSON fetch aborted (timeout)", url);
              lastTimedOutRef.current = url;
            }
          }
          // otherwise ignore - likely caused by quick navigation/cleanup
        } else {
          console.error("Error loading GeoJSON data:", err);
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    const debounceId = setTimeout(load, debounceDelay);

    return () => {
      mounted = false;
      try {
        controller.abort();
      } catch {}
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(debounceId);
    };
  }, [selection, manifest, vectorTilesUrl]);

  // Vector tiles are handled by the module-scoped `VectorTileLayer` component
  // declared near the top of this file. We intentionally avoid declaring
  // components inside render to preserve stable identities and state.

  // Styling & interaction helpers for GeoJSON
  const hash = (s: string) =>
    Array.from(s).reduce((t, c) => t + c.charCodeAt(0), 0);

  const getDistrictStyle = (feature: any) => {
    const props = feature?.properties;
    const provinceKey = resolveProvinceKey(props);
    const featureKey =
      selection.level === "country"
        ? provinceKey
        : selection.level === "province"
          ? resolveDistrictName(props)
          : resolveLocalBodyLabel(props);

    if (selection.level === "country") {
      const palette = (provinceKey && PROVINCE_COLORS[provinceKey]) || {
        fill: "#E2E8F0",
        border: "#64748B",
      };
      return {
        fillColor: palette.fill,
        weight: 1.2,
        opacity: 1,
        color: palette.border,
        fillOpacity: 0.85,
      };
    }

    const hue = hash(featureKey || "") % 360;
    return {
      fillColor: `hsl(${hue} 70% 78%)`,
      weight: 1,
      opacity: 1,
      color: `hsl(${hue} 65% 42%)`,
      fillOpacity: 0.45,
    };
  };

  const bindSafeTooltip = (layer: any, text: string) => {
    const el = document.createElement("div");
    el.textContent = String(text || "");
    layer.bindTooltip(el, { sticky: true });
  };

  const handleFeatureClick = (feature: any) => {
    const props = feature?.properties;
    const provinceId = resolveProvinceId(props);
    const provinceLabel =
      resolveProvinceLabel(props) ||
      (provinceId ? `Province ${provinceId}` : null);
    const districtName = resolveDistrictName(props) || null;
    const localBodyName = resolveLocalBodyLabel(props) || null;
    const localBodyType =
      str(propGet(props, "FIRST_Type", "TYPE", "type")) || null;
    // click behavior depends on current selection.level
    if (selection.level === "country" && provinceId) {
      setSelection({
        level: "province",
        provinceId,
        provinceLabel,
        districtName: null,
        localBodyName: null,
        localBodyType: null,
      });
      return;
    }
    if (selection.level === "province" && districtName) {
      setSelection((cur) => ({
        level: "district",
        provinceId: cur.provinceId,
        provinceLabel: cur.provinceLabel,
        districtName,
        localBodyName: null,
        localBodyType: null,
      }));
      return;
    }
    if (
      (selection.level === "district" || selection.level === "localBody") &&
      localBodyName
    ) {
      setSelection((cur) => ({
        level: "localBody",
        provinceId: cur.provinceId,
        provinceLabel: cur.provinceLabel,
        districtName: cur.districtName,
        localBodyName,
        localBodyType,
      }));
      return;
    }
  };

  const onEachFeature = (feature: any, layer: any) => {
    const props = feature?.properties;
    const provinceId = resolveProvinceId(props);
    const provinceLabel = resolveProvinceLabel(props);
    const districtName = resolveDistrictName(props) || "District";
    const localBody = resolveLocalBodyLabel(props) || "Local body";

    const normalizeType = (t: string | undefined) => {
      if (!t) return "Local body";
      const s = String(t).toLowerCase();
      if (s.includes("gaun")) return "Rural municipality";
      if (
        s.includes("nagar") ||
        s.includes("nagarpalika") ||
        s.includes("municipal")
      )
        return "Municipality";
      if (s.includes("metro") || s.includes("metrop"))
        return "Metropolitan city";
      return t;
    };

    let label = "";
    if (selection.level === "country") {
      label = provinceLabel
        ? `${provinceLabel} Province`
        : `Province ${provinceId || ""}`;
    } else if (selection.level === "province") {
      label = `${districtName} District`;
    } else {
      const rawType = String(
        propGet(props, "FIRST_Type", "TYPE", "type") || "",
      );
      const typeLabel = normalizeType(rawType);
      label = `${localBody} ${typeLabel}`.trim();
    }
    bindSafeTooltip(layer, label);

    layer.on("click", () => handleFeatureClick(feature));
    layer.on("mouseover", (e: any) => {
      try {
        e.target.setStyle({ fillOpacity: 1, weight: 2.2 });
      } catch {}
    });
    layer.on("mouseout", (e: any) => {
      try {
        e.target.setStyle(getDistrictStyle(feature));
      } catch {}
    });
  };

  // JSX
  const visibleGeoJsonData = useMemo(() => {
    if (
      !geoJsonData ||
      selection.level !== "localBody" ||
      !selection.localBodyName
    ) {
      return geoJsonData;
    }

    const target = normalizeKey(selection.localBodyName);
    const features = Array.isArray(geoJsonData.features)
      ? geoJsonData.features.filter(
          (feature: any) =>
            normalizeKey(resolveLocalBodyLabel(feature?.properties) || "") ===
            target,
        )
      : [];

    return features.length > 0
      ? {
          ...geoJsonData,
          features,
        }
      : geoJsonData;
  }, [geoJsonData, selection.level, selection.localBodyName]);

  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden bg-[#FAFAFA] border border-gray-200 shadow-sm relative z-0 flex items-center justify-center"
    >
      {selection.level !== "country" && (
        <button
          type="button"
          onClick={() =>
            setSelection((cur) =>
              cur.level === "localBody"
                ? {
                    level: "district",
                    provinceId: cur.provinceId,
                    provinceLabel: cur.provinceLabel,
                    districtName: cur.districtName,
                    localBodyName: null,
                    localBodyType: null,
                  }
                : cur.level === "district"
                  ? {
                      level: "province",
                      provinceId: cur.provinceId,
                      provinceLabel: cur.provinceLabel,
                      districtName: null,
                      localBodyName: null,
                      localBodyType: null,
                    }
                  : {
                      level: "country",
                      provinceId: null,
                      provinceLabel: null,
                      districtName: null,
                      localBodyName: null,
                      localBodyType: null,
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
            <FitGeoJsonBounds data={visibleGeoJsonData} />
            {visibleGeoJsonData && (
              <GeoJSON
                data={visibleGeoJsonData}
                style={getDistrictStyle}
                onEachFeature={onEachFeature}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
