"use client";

import { useMemo, useState } from "react";

import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import grievances from "../../../../data/grievances.json";
import syncBatches from "../../../../data/sync-batches.json";
import editApprovals from "../../../../data/edit-approvals.json";
import municipalities from "../../../../data/municipalities.json";

type SortKey =
  | "name_en"
  | "type"
  | "totalCitizens"
  | "nidVerified"
  | "pendingApprovals"
  | "activeGrievances"
  | "lastSync";

export default function MunicipalitiesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedMunicipality, setSelectedMunicipality] = useState<{
    id: string;
    name_en: string;
    type: string;
    totalCitizens: number;
  } | null>(null);

  const municipalityData = useMemo(
    () =>
      municipalities.map((municipality) => {
        const municipalityWards = wards.filter(
          (ward) => ward.municipality_id === municipality.id,
        );
        const wardIds = municipalityWards.map((ward) => ward.id);
        const municipalityCitizens = citizens.filter((citizen) =>
          wardIds.includes(citizen.ward_id),
        );
        const citizenIds = municipalityCitizens.map((citizen) => citizen.id);
        const municipalitySyncs = syncBatches.filter((batch) =>
          wardIds.includes(batch.ward_id),
        );

        return {
          ...municipality,
          totalCitizens: municipalityCitizens.length,
          nidVerified: municipalityCitizens.length
            ? Math.round(
                (municipalityCitizens.filter((citizen) => citizen.nid_verified)
                  .length /
                  municipalityCitizens.length) *
                  100,
              )
            : 0,
          pendingApprovals: editApprovals.filter((approval) =>
            citizenIds.includes(approval.citizen_id),
          ).length,
          activeGrievances: grievances.filter((grievance) =>
            citizenIds.includes(grievance.citizen_id),
          ).length,
          lastSync: municipalitySyncs.length
            ? municipalitySyncs
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.submitted_at).getTime() -
                    new Date(a.submitted_at).getTime(),
                )[0].submitted_at
            : "N/A",
        };
      }),
    [],
  );

  const filtered = municipalityData.filter(
    (municipality) =>
      (typeFilter === "ALL" || municipality.type === typeFilter) &&
      municipality.name_en.toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number")
        return sortDirection === "asc" ? av - bv : bv - av;
      return sortDirection === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortKey, sortDirection]);

  const rowsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  function handleSort(key: SortKey) {
    setCurrentPage(1);
    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const wardStats = selectedMunicipality
    ? wards
        .filter((ward) => ward.municipality_id === selectedMunicipality.id)
        .map((ward) => {
          const wardCitizens = citizens.filter(
            (citizen) => citizen.ward_id === ward.id,
          );
          return {
            id: ward.id,
            wardNo: ward.ward_no,
            totalCitizens: wardCitizens.length,
            nidVerified: wardCitizens.length
              ? Math.round(
                  (wardCitizens.filter((citizen) => citizen.nid_verified)
                    .length /
                    wardCitizens.length) *
                    100,
                )
              : 0,
          };
        })
    : [];

  const columns: { label: string; key: SortKey }[] = [
    { label: "Municipality", key: "name_en" },
    { label: "Type", key: "type" },
    { label: "Citizens", key: "totalCitizens" },
    { label: "NID Verified", key: "nidVerified" },
    { label: "Approvals", key: "pendingApprovals" },
    { label: "Grievances", key: "activeGrievances" },
    { label: "Last Sync", key: "lastSync" },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 md:px-6 lg:px-8">
      <header className="mb-5">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-gray-400">Province Portal</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-[#F04438]">Municipalities</span>
        </div>
        <p className="mt-2 text-xs font-medium text-gray-400">Province Admin</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-[28px]">
          Municipality Comparison
        </h1>
        <p className="mt-1.5 text-xs text-gray-500">
          Compare citizen registration, verification, approvals, grievances and
          synchronization status.
        </p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search municipality..."
            className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none ring-0 placeholder:text-gray-400 focus:border-[#155EEF] focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 outline-none focus:border-[#155EEF]"
          >
            <option value="ALL">All Types</option>
            <option value="URBAN_MUNICIPALITY">Urban Municipality</option>
            <option value="RURAL_MUNICIPALITY">Rural Municipality</option>
          </select>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h2 className="text-[13px] font-bold text-gray-800">
              Municipality Performance
            </h2>
            <p className="mt-1 text-[10px] text-gray-400">
              {sorted.length} municipalities found
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#155EEF]">
            Analytical View
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-400">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    className="cursor-pointer px-4 py-3 font-semibold hover:text-gray-700"
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      {sortKey === column.key && (
                        <span className="text-[#155EEF]">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((municipality) => (
                <tr
                  key={municipality.id}
                  onClick={() => setSelectedMunicipality(municipality)}
                  className="cursor-pointer border-t border-gray-100 hover:bg-blue-50/40"
                >
                  <td className="px-4 py-3 font-semibold text-[#123B78]">
                    {municipality.name_en}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {municipality.type}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {municipality.totalCitizens.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-600">
                      {municipality.nidVerified}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {municipality.pendingApprovals}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {municipality.activeGrievances}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {municipality.lastSync}
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-xs text-gray-400"
                  >
                    No municipalities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <button
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage === 1}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[10px] text-gray-400">
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={safePage === totalPages}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>

      {selectedMunicipality && (
        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] text-gray-400">Selected municipality</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">
                {selectedMunicipality.name_en}
              </h2>
            </div>
            <button
              onClick={() => setSelectedMunicipality(null)}
              className="self-start rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-semibold text-gray-500"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-[10px] text-gray-400">Type</p>
              <p className="mt-1 text-xs font-semibold text-gray-700">
                {selectedMunicipality.type}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-[10px] text-gray-400">Total Wards</p>
              <p className="mt-1 text-xs font-semibold text-gray-700">
                {wardStats.length}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-[10px] text-gray-400">Total Citizens</p>
              <p className="mt-1 text-xs font-semibold text-gray-700">
                {selectedMunicipality.totalCitizens.toLocaleString()}
              </p>
            </div>
          </div>

          <h3 className="mb-3 mt-5 text-[13px] font-bold text-gray-800">
            Ward Statistics
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400">
                <tr>
                  <th className="px-3 py-3">Ward</th>
                  <th className="px-3 py-3">Citizens</th>
                  <th className="px-3 py-3">NID Verified</th>
                </tr>
              </thead>
              <tbody>
                {wardStats.map((ward) => (
                  <tr key={ward.id} className="border-t border-gray-100">
                    <td className="px-3 py-3 text-gray-600">
                      Ward {ward.wardNo}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {ward.totalCitizens}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {ward.nidVerified}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="mt-6 border-t border-gray-200 py-4 text-center text-[10px] text-gray-400">
        Digital Nepal E-Governance System
      </footer>
    </main>
  );
}
