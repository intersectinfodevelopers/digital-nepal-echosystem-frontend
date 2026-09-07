"use client";

import Link from "next/link";
import { useEffect, useMemo, type ReactNode } from "react";
import { useMapSelection } from "@/contexts/MapSelectionContext";

import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import municipalities from "../../../../data/municipalities.json";
import idCards from "../../../../data/id-cards.json";
import syncBatches from "../../../../data/sync-batches.json";

type Province = {
  id: string;
  name: string;
  capital: string;
  districts: number;
};

type District = {
  name: string;
  citizens: number;
  municipalities: number;
  localBodies: number;
  wards: number;
  cards: number;
};

const provinces: Province[] = [
  {
    id: "prov-1",
    name: "Koshi Province",
    capital: "Biratnagar",
    districts: 14,
  },
  { id: "prov-2", name: "Madhesh Province", capital: "Janakpur", districts: 8 },
  { id: "prov-3", name: "Bagmati Province", capital: "Hetauda", districts: 13 },
  { id: "prov-4", name: "Gandaki Province", capital: "Pokhara", districts: 11 },
  {
    id: "prov-5",
    name: "Lumbini Province",
    capital: "Deukhuri",
    districts: 12,
  },
  {
    id: "prov-6",
    name: "Karnali Province",
    capital: "Birendranagar",
    districts: 10,
  },
  {
    id: "prov-7",
    name: "Sudurpashchim Province",
    capital: "Godawari",
    districts: 9,
  },
];

const koshiDistricts: District[] = [
  {
    name: "Taplejung",
    citizens: 9940,
    municipalities: 4,
    localBodies: 9,
    wards: 61,
    cards: 6840,
  },
  {
    name: "Panchthar",
    citizens: 0,
    municipalities: 0,
    localBodies: 0,
    wards: 0,
    cards: 0,
  },
  {
    name: "Ilam",
    citizens: 0,
    municipalities: 0,
    localBodies: 0,
    wards: 0,
    cards: 0,
  },
  {
    name: "Jhapa",
    citizens: 0,
    municipalities: 0,
    localBodies: 0,
    wards: 0,
    cards: 0,
  },
  {
    name: "Tehrathum",
    citizens: 0,
    municipalities: 0,
    localBodies: 0,
    wards: 0,
    cards: 0,
  },
  {
    name: "Dhankuta",
    citizens: 0,
    municipalities: 0,
    localBodies: 0,
    wards: 0,
    cards: 0,
  },
  {
    name: "Sunsari",
    citizens: 0,
    municipalities: 0,
    localBodies: 0,
    wards: 0,
    cards: 0,
  },
];

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      <path d="M16 3.2a4 4 0 0 1 0 7.6M19 15a4 4 0 0 1 3 3.8V21" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 9h4M7 13h2M15 13h2" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function StatCard({
  title,
  value,
  note,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  note: string;
  icon: ReactNode;
  tone: "blue" | "green" | "red" | "orange";
}) {
  const tones = {
    blue: "border-t-[#155EEF] text-[#155EEF] bg-blue-50",
    green: "border-t-[#17B26A] text-[#17B26A] bg-green-50",
    red: "border-t-[#F04438] text-[#F04438] bg-red-50",
    orange: "border-t-[#F79009] text-[#F79009] bg-orange-50",
  };

  return (
    <div
      className={`rounded-xl border border-gray-200 border-t-[3px] bg-white p-4 shadow-sm ${tones[tone].split(" ")[0]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-gray-500">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">{note}</p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone].split(" ").slice(2).join(" ")}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-[#123B78]" />
            <h2 className="text-[15px] font-bold text-gray-800">{title}</h2>
          </div>
          {subtitle && (
            <p className="ml-4 mt-1 text-[11px] text-gray-400">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MiniBar({
  label,
  value,
  max,
  tone = "blue",
}: {
  label: string;
  value: number;
  max: number;
  tone?: "blue" | "green" | "orange";
}) {
  const color =
    tone === "green"
      ? "bg-[#17B26A]"
      : tone === "orange"
        ? "bg-[#F79009]"
        : "bg-[#123B78]";
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 truncate text-[11px] text-gray-500">
        {label}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.max(4, (value / Math.max(max, 1)) * 100)}%` }}
        />
      </div>
      <span className="w-12 text-right text-[11px] font-semibold text-gray-600">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export default function ProvinceDashboard() {
  const { selectProvince } = useMapSelection();

  const provinceId = useMemo(() => {
    if (typeof window === "undefined") return "prov-1";
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];
    if (!token) return "prov-1";
    try {
      const decoded: { jurisdiction_id?: string } = JSON.parse(atob(token));
      const value = decoded.jurisdiction_id ?? "";
      if (value.toLowerCase().startsWith("prov-")) return value.toLowerCase();
      if (/^[1-7]$/.test(value)) return `prov-${value}`;
    } catch {}
    return "prov-1";
  }, []);

  const province =
    provinces.find((item) => item.id === provinceId) ?? provinces[0];

  useEffect(() => {
    selectProvince(province.id.replace("prov-", ""), province.name);
  }, [province.id, province.name, selectProvince]);

  const stats = useMemo(() => {
    const provinceNumber = province.id.replace("prov-", "");
    const provinceWards = wards.filter((ward) =>
      provinceNumber === "1" ? ward.id.startsWith("ward-") : false,
    );
    const wardIds = new Set(provinceWards.map((ward) => ward.id));
    const provinceCitizens = citizens.filter((citizen) =>
      wardIds.has(citizen.ward_id),
    );
    const municipalityIds = new Set(
      provinceWards.map((ward) => ward.municipality_id),
    );
    const provinceMunicipalities = municipalities.filter((municipality) =>
      municipalityIds.has(municipality.id),
    );
    const citizenIds = new Set(provinceCitizens.map((citizen) => citizen.id));
    const provinceCards = idCards.filter((card) =>
      citizenIds.has(card.citizen_id),
    );
    return {
      citizens: provinceCitizens.length,
      municipalities: provinceMunicipalities.length,
      wards: provinceWards.length,
      cards: provinceCards.length,
    };
  }, [province.id]);

  const recentSyncs = useMemo(() => syncBatches.slice(0, 5), []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 md:px-6 lg:px-8">
      <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-gray-400">Province Portal</span>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-[#F04438]">Dashboard</span>
          </div>
          <p className="mt-2 text-xs font-medium text-gray-400">
            Province Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-[28px]">
            {province.name} Dashboard
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-gray-500">
            Province-level analytical overview of citizen registration,
            municipalities, identity cards and administrative activity.
          </p>
          <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-[#155EEF]">
            Analytical View Only — No write access to citizen records.
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/province/analytics"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
          >
            View Analytics
          </Link>
          <Link
            href="/province/national-map"
            className="rounded-lg bg-[#092E68] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#062553]"
          >
            View Map
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Citizens"
          value={stats.citizens.toLocaleString()}
          note="Registered in selected province"
          icon={<UsersIcon />}
          tone="blue"
        />
        <StatCard
          title="Municipalities"
          value={stats.municipalities.toLocaleString()}
          note="Local bodies in dataset"
          icon={<BuildingIcon />}
          tone="green"
        />
        <StatCard
          title="Province Wards"
          value={stats.wards.toLocaleString()}
          note={`${province.districts} official districts`}
          icon={<MapIcon />}
          tone="red"
        />
        <StatCard
          title="ID Cards Issued"
          value={stats.cards.toLocaleString()}
          note="Across municipalities"
          icon={<CardIcon />}
          tone="orange"
        />
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Section
          title="Province Overview"
          subtitle="Administrative structure of the selected province"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3">Province</th>
                  <th className="px-4 py-3">Capital</th>
                  <th className="px-4 py-3">Districts</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {provinces.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-t border-gray-100 ${item.id === province.id ? "bg-blue-50/40" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.capital}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.districts}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.id === province.id ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        {item.id === province.id ? "Selected" : "National"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="Registration Coverage"
          subtitle="Current platform coverage"
        >
          <div className="space-y-4 p-4">
            <MiniBar
              label="Citizen registration"
              value={Math.min(stats.citizens, 48236)}
              max={48236}
            />
            <MiniBar
              label="NID verification"
              value={95}
              max={100}
              tone="green"
            />
            <MiniBar
              label="ID card issuance"
              value={Math.min(stats.cards, 4836)}
              max={4836}
              tone="orange"
            />
            <div className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-2.5 text-[11px] leading-5 text-purple-600">
              Coverage figures are calculated from the currently synchronized
              province dataset.
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-4">
        <Section
          title="Registration & Social Profiles"
          subtitle="Province-level records shown in the analytical dashboard"
        >
          <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
            {[
              ["Households", "13", "Registered profiles", "blue"],
              ["Employment", "41", "Employment profiles", "green"],
              ["Education", "393", "Education records", "red"],
              ["Disability", "8", "Registered profiles", "orange"],
            ].map(([title, value, note, tone]) => (
              <div
                key={title}
                className="rounded-lg border border-gray-200 p-3"
              >
                <p className="text-[11px] text-gray-400">{title}</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
                <p
                  className={`mt-1 text-[10px] ${tone === "green" ? "text-green-600" : tone === "red" ? "text-red-500" : tone === "orange" ? "text-orange-500" : "text-blue-600"}`}
                >
                  {note}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="mt-4">
        <Section
          title="District Breakdown"
          subtitle="Official district, local-body, ward and ID-card figures"
          action={
            <button
              type="button"
              className="rounded-lg bg-[#092E68] px-3.5 py-2 text-[11px] font-semibold text-white"
            >
              Full Comparison
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">NID Citizens</th>
                  <th className="px-4 py-3">Municipalities</th>
                  <th className="px-4 py-3">Local Bodies</th>
                  <th className="px-4 py-3">Wards</th>
                  <th className="px-4 py-3">ID Cards</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {koshiDistricts.map((district) => (
                  <tr
                    key={district.name}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {district.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {district.citizens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {district.municipalities}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {district.localBodies}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {district.wards.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {district.cards.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/province/districts/${district.name.toLowerCase()}`}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 text-[10px] font-semibold text-gray-500 hover:bg-gray-100"
                      >
                        View <ArrowIcon />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Section
          title="Recent Activity"
          subtitle="Latest synchronization batches"
        >
          <div className="divide-y divide-gray-100 p-4">
            {recentSyncs.map((batch) => (
              <div
                key={batch.batch_id}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <span className="text-gray-600">{batch.ward_id}</span>
                <span
                  className={
                    batch.status === "COMPLETED"
                      ? "font-semibold text-green-600"
                      : "font-semibold text-orange-500"
                  }
                >
                  {batch.status === "COMPLETED" ? "Completed" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Pending Activity" subtitle="Items requiring attention">
          <div className="divide-y divide-gray-100 p-4">
            {["ward-012", "ward-004", "ward-003"].map((wardId, index) => (
              <div
                key={wardId}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <span className="text-gray-600">{wardId}</span>
                <span
                  className={
                    index === 0
                      ? "rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-500"
                      : "rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-500"
                  }
                >
                  {index === 0 ? "Needs review" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <footer className="mt-6 border-t border-gray-200 py-4 text-center text-[10px] text-gray-400">
        Digital Nepal E-Governance System
      </footer>
    </main>
  );
}
