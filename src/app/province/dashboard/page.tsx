"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";

import { useMapSelection } from "@/contexts/MapSelectionContext";
import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import municipalities from "../../../../data/municipalities.json";
import idCards from "../../../../data/id-cards.json";
import syncBatches from "../../../../data/sync-batches.json";

import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";

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

type ProvinceInfo = {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
};

const PROVINCES: Record<string, ProvinceInfo> = {
  "prov-1": {
    id: "prov-1",
    name: "Koshi Province",
    center: [27.2, 87.3],
    zoom: 8,
  },
  "prov-2": {
    id: "prov-2",
    name: "Madhesh Province",
    center: [26.9, 85.9],
    zoom: 8,
  },
  "prov-3": {
    id: "prov-3",
    name: "Bagmati Province",
    center: [27.6, 85.5],
    zoom: 8,
  },
  "prov-4": {
    id: "prov-4",
    name: "Gandaki Province",
    center: [28.3, 84.0],
    zoom: 8,
  },
  "prov-5": {
    id: "prov-5",
    name: "Lumbini Province",
    center: [27.8, 83.3],
    zoom: 8,
  },
  "prov-6": {
    id: "prov-6",
    name: "Karnali Province",
    center: [29.0, 82.3],
    zoom: 7,
  },
  "prov-7": {
    id: "prov-7",
    name: "Sudurpashchim Province",
    center: [29.3, 80.7],
    zoom: 7,
  },
};

function normalizeProvinceId(value: string | null): string | null {
  if (!value) return null;

  const normalized = value.toLowerCase().trim();

  if (normalized.startsWith("prov-")) {
    return normalized;
  }

  if (/^[1-7]$/.test(normalized)) {
    return `prov-${normalized}`;
  }

  return null;
}

function syncStatusColor(status: string): string {
  if (status === "SYNCED" || status === "COMPLETED") {
    return "text-success";
  }

  if (status === "PENDING" || status === "IN_PROGRESS") {
    return "text-warning";
  }

  if (status === "CONFLICT" || status === "FAILED") {
    return "text-danger";
  }

  return "text-muted";
}

export default function ProvinceDashboard() {
  const { selectProvince } = useMapSelection();

  const provinceId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      return null;
    }

    try {
      const decoded = JSON.parse(atob(token));

      return normalizeProvinceId(
        typeof decoded.jurisdiction_id === "string"
          ? decoded.jurisdiction_id
          : null,
      );
    } catch {
      return null;
    }
  }, []);

  const province = provinceId ? PROVINCES[provinceId] : PROVINCES["prov-1"];

  useEffect(() => {
    selectProvince(province.id.replace("prov-", ""), province.name);
  }, [province.id, province.name, selectProvince]);

  const stats = useMemo(() => {
    const provinceNumber = province.id.replace("prov-", "");

    const provinceWards = wards.filter((ward) => {
      if (provinceNumber === "1") {
        return ward.id.startsWith("ward-");
      }

      return false;
    });

    const provinceWardIds = new Set(provinceWards.map((ward) => ward.id));

    const provinceCitizens = citizens.filter((citizen) =>
      provinceWardIds.has(citizen.ward_id),
    );

    const provinceMunicipalityIds = new Set(
      provinceWards.map((ward) => ward.municipality_id),
    );

    const provinceMunicipalities = municipalities.filter((municipality) =>
      provinceMunicipalityIds.has(municipality.id),
    );

    const provinceIdCards = idCards.filter((card) =>
      provinceCitizens.some((citizen) => citizen.id === card.citizen_id),
    );

    return {
      totalCitizens: provinceCitizens.length,
      totalMunicipalities: provinceMunicipalities.length,
      totalWards: provinceWards.length,
      idCardsIssued: provinceIdCards.length,
    };
  }, [province.id]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary">
        {province.name} Dashboard
      </h1>

      <div className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-medium text-warning">
        Province Admin — Analytical View Only. No write access to citizen
        records.
      </div>

      {/* Province Statistics */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Citizens" value={stats.totalCitizens} />

        <StatCard
          label="Total Municipalities"
          value={stats.totalMunicipalities}
        />

        <StatCard label="Total Wards" value={stats.totalWards} />

        <StatCard label="ID Cards Issued" value={stats.idCardsIssued} />
      </div>

      {/* Overall Province Map */}
      <div className="mt-8">
        <Card
          accentColor="border-primary"
          header={
            <div>
              <h2 className="text-lg font-semibold text-secondary">
                {province.name} Map
              </h2>

              <p className="mt-1 text-sm text-muted">
                Overall geographical view of {province.name}
              </p>
            </div>
          }
        >
          <div className="h-[500px] w-full overflow-hidden rounded-xl">
            <LeafletMap
              center={province.center}
              zoom={province.zoom}
              height="100%"
              minimumLevel="province"
            />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card
          accentColor="border-primary"
          header={
            <h2 className="text-lg font-semibold text-secondary">
              Recent Activity
            </h2>
          }
        >
          <div className="space-y-6">
            {/* Sync batches */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted">
                Recent Sync Batches
              </h3>

              <ul className="mt-2 divide-y divide-border">
                {syncBatches.slice(0, 5).map((batch) => (
                  <li
                    key={batch.batch_id}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-secondary">{batch.ward_id}</span>

                    <span
                      className={`font-medium ${syncStatusColor(batch.status)}`}
                    >
                      {batch.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ID card approvals */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted">
                Recent ID Card Approvals
              </h3>

              <ul className="mt-2 divide-y divide-border">
                {idCards
                  .filter((card) => card.status === "APPROVED")
                  .slice(0, 5)
                  .map((card) => (
                    <li key={card.id} className="py-2 text-sm text-secondary">
                      {card.card_type} Card ({card.id})
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
