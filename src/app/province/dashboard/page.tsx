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

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#123b78]">
      {children}
    </span>
  );
}

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
      <path d="M16 3.2a4 4 0 0 1 0 7.6" />
      <path d="M19 15a4 4 0 0 1 3 3.8V21" />
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
function FlagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 21V4" />
      <path d="M5 5c4-3 7 3 14 0v10c-7 3-10-3-14 0" />
    </svg>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 border-l-4 ${accent} bg-white p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>
        <Icon>{icon}</Icon>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-[#123b78]" />
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
        </div>
        {subtitle && (
          <p className="ml-4 mt-1 text-xs text-gray-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function ProgressRow({
  label,
  percentage,
  className,
}: {
  label: string;
  percentage: number;
  className: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-xs text-gray-500">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${className}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-gray-500">
        {percentage}%
      </span>
    </div>
  );
}

function QuickAction({
  title,
  value,
  subtitle,
  href,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-gray-200 border-l-4 border-l-[#123b78] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <Icon>{icon}</Icon>
        <div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-red-400">{subtitle}</p>}
        </div>
      </div>
    </Link>
  );
}

function normalizeProvinceId(value: string | null): string {
  if (!value) return "prov-1";
  const normalized = value.toLowerCase().trim();
  if (normalized.startsWith("prov-")) return normalized;
  if (/^[1-7]$/.test(normalized)) return `prov-${normalized}`;
  return "prov-1";
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
      return normalizeProvinceId(
        typeof decoded.jurisdiction_id === "string"
          ? decoded.jurisdiction_id
          : null,
      );
    } catch {
      return "prov-1";
    }
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

  const recentSyncs = useMemo(() => syncBatches.slice(0, 4), []);

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-5 md:px-6 lg:px-8">
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Province Portal</span>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-red-500">Dashboard</span>
          </div>
          <p className="mt-2 text-sm text-gray-400">Province Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Koshi Province Dashboard
          </h1>
          <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600">
            Province Admin — Analytical View Only. No write access to citizen
            records.
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            href="/province/analytics"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
          >
            View Analytics
          </Link>
          <Link
            href="/province/national-map"
            className="rounded-lg bg-[#092e68] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#062553]"
          >
            View Map
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Citizens"
          value={stats.citizens.toLocaleString()}
          subtitle="↑ 5% this week"
          icon={<UsersIcon />}
          accent="border-l-blue-500"
        />
        <StatCard
          title="Total Provinces"
          value="7"
          subtitle="Across Nepal"
          icon={<BuildingIcon />}
          accent="border-l-green-500"
        />
        <StatCard
          title="Province Districts"
          value={province.districts}
          subtitle="Official districts"
          icon={<FlagIcon />}
          accent="border-l-pink-500"
        />
        <StatCard
          title="ID Cards Issued"
          value={stats.cards.toLocaleString()}
          subtitle="Across municipalities"
          icon={<CardIcon />}
          accent="border-l-orange-500"
        />
      </section>

      <section className="mt-6">
        <SectionTitle
          title="Province Level Structure"
          subtitle="प्रदेश संरचनाको विवरण"
        />
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-[1.5fr_1fr_0.7fr] bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-400">
              <span>Province Name</span>
              <span>Capital</span>
              <span>Districts</span>
            </div>
            {provinces.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.5fr_1fr_0.7fr] border-t border-gray-100 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-gray-700">{item.name}</span>
                <span className="font-medium text-gray-600">
                  {item.capital}
                </span>
                <span className="text-gray-600">{item.districts}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Composition
            </p>
            <div className="space-y-5">
              <ProgressRow
                label="Metropolitan City"
                percentage={1}
                className="bg-blue-300"
              />
              <ProgressRow
                label="Sub-Metropolitan City"
                percentage={1}
                className="bg-blue-300"
              />
              <ProgressRow
                label="Municipality"
                percentage={37}
                className="bg-purple-500"
              />
              <ProgressRow
                label="Rural Municipality"
                percentage={61}
                className="bg-green-500"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle
          title="Registration Coverage"
          subtitle="Aggregated registration coverage for the selected province"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Households Registered"
            value="13"
            subtitle="26.1% below target"
            icon={<UsersIcon />}
            accent="border-l-blue-500"
          />
          <StatCard
            title="Employment Profiles"
            value="41"
            subtitle="Across municipalities"
            icon={<BuildingIcon />}
            accent="border-l-green-500"
          />
          <StatCard
            title="Education Records"
            value="393"
            subtitle="4% dropout rate"
            icon={<CardIcon />}
            accent="border-l-pink-500"
          />
          <StatCard
            title="Disability Profiles"
            value="8"
            subtitle="6.8% of population"
            icon={<FlagIcon />}
            accent="border-l-orange-500"
          />
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle
          title="Quick Action"
          subtitle="Frequently used province tools"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            title="Citizen Lookup"
            value="13"
            href="/province/citizens"
            icon={<UsersIcon />}
          />
          <QuickAction
            title="Investigation Requests"
            value="41"
            href="/province/investigations"
            icon={<BuildingIcon />}
          />
          <QuickAction
            title="Flag Anomaly"
            value="393"
            subtitle="4% dropout rate"
            href="/province/anomalies"
            icon={<FlagIcon />}
          />
          <QuickAction
            title="Province Admins"
            value="8"
            subtitle="6.8% of population"
            href="/province/admins"
            icon={<UsersIcon />}
          />
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle
          title="District Breakdown — Administrative Structure"
          subtitle="Official district, local-body and ward counts with platform figures"
          action={
            <button
              type="button"
              className="rounded-lg bg-[#092e68] px-4 py-2 text-xs font-semibold text-white"
            >
              Full Comparison
            </button>
          }
        />
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3">District Name</th>
                <th className="px-4 py-3">NID Citizens</th>
                <th className="px-4 py-3">Municipalities</th>
                <th className="px-4 py-3">Total Local Bodies</th>
                <th className="px-4 py-3">Wards</th>
                <th className="px-4 py-3">ID Cards</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {koshiDistricts.map((district) => (
                <tr key={district.name} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {district.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {district.citizens.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {district.municipalities}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {district.localBodies}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {district.wards.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {district.cards.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/province/districts/${district.name.toLowerCase()}`}
                      className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-4">
            <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
            <p className="mt-1 text-xs text-gray-400">Recent sync batches</p>
          </div>
          <div className="space-y-3 p-4">
            {recentSyncs.map((batch) => (
              <div
                key={batch.batch_id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600">{batch.ward_id}</span>
                <span
                  className={
                    batch.status === "COMPLETED"
                      ? "font-semibold text-green-500"
                      : "font-semibold text-orange-400"
                  }
                >
                  {batch.status === "COMPLETED" ? "Completed" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-4">
            <h3 className="text-sm font-bold text-gray-800">
              Pending Activity
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Items requiring attention
            </p>
          </div>
          <div className="space-y-3 p-4 text-sm">
            {["ward-012", "ward-004", "ward-003"].map((wardId) => (
              <div key={wardId} className="flex items-center justify-between">
                <span className="text-gray-600">{wardId}</span>
                <span className="font-semibold text-orange-400">Pending</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-8 border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Digital Nepal E-Governance System
      </footer>
    </main>
  );
}
