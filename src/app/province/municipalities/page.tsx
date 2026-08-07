"use client";

import { useState } from "react";

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

  const municipalityData = municipalities.map((municipality) => {
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

      nidVerified:
        municipalityCitizens.length > 0
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

      lastSync:
        municipalitySyncs.length > 0
          ? municipalitySyncs.sort(
              (a, b) =>
                new Date(b.submitted_at).getTime() -
                new Date(a.submitted_at).getTime(),
            )[0].submitted_at
          : "N/A",
    };
  });

  const filteredMunicipalities = municipalityData.filter(
    (municipality) =>
      (typeFilter === "ALL" || municipality.type === typeFilter) &&
      municipality.name_en.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedMunicipalities = sortKey
    ? [...filteredMunicipalities].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortDirection === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      })
    : filteredMunicipalities;

  const rowsPerPage = 5;

  const totalPages = Math.max(
    1,
    Math.ceil(sortedMunicipalities.length / rowsPerPage),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedMunicipalities = sortedMunicipalities.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

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

            nidVerified:
              wardCitizens.length > 0
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
    { label: "Total Citizens", key: "totalCitizens" },
    { label: "NID Verified %", key: "nidVerified" },
    { label: "Pending Approvals", key: "pendingApprovals" },
    { label: "Active Grievances", key: "activeGrievances" },
    { label: "Last Sync", key: "lastSync" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="mb-6 text-2xl font-bold text-secondary">
        Municipality Comparison
      </h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search municipality..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-md border border-border bg-surface p-2 text-sm text-secondary shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-md border border-border bg-surface p-2 text-sm text-secondary shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="ALL">All Types</option>
          <option value="URBAN_MUNICIPALITY">Urban Municipality</option>
          <option value="RURAL_MUNICIPALITY">Rural Municipality</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-background">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="cursor-pointer select-none border-b border-border p-3 text-left font-semibold text-muted hover:text-secondary transition-colors"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-primary">
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedMunicipalities.map((municipality) => (
              <tr
                key={municipality.id}
                onClick={() => setSelectedMunicipality(municipality)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-background transition-colors"
              >
                <td className="p-3 font-medium text-primary">
                  {municipality.name_en}
                </td>

                <td className="p-3 text-secondary">{municipality.type}</td>

                <td className="p-3 text-secondary">
                  {municipality.totalCitizens}
                </td>

                <td className="p-3 text-secondary">
                  {municipality.nidVerified}%
                </td>

                <td className="p-3 text-secondary">
                  {municipality.pendingApprovals}
                </td>

                <td className="p-3 text-secondary">
                  {municipality.activeGrievances}
                </td>

                <td className="p-3 text-muted">{municipality.lastSync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          disabled={safePage === 1}
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-secondary shadow-card disabled:opacity-40 hover:bg-background transition-colors"
        >
          Previous
        </button>

        <span className="text-sm text-muted">
          Page {safePage} of {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((page) => Math.min(page + 1, totalPages))
          }
          disabled={safePage === totalPages}
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-secondary shadow-card disabled:opacity-40 hover:bg-background transition-colors"
        >
          Next
        </button>
      </div>

      {selectedMunicipality && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-secondary">
            {selectedMunicipality.name_en}
          </h2>

          <div className="mb-4 rounded-lg border border-border bg-surface p-4 shadow-card text-sm text-secondary">
            <p>
              <span className="text-muted">Type:</span>{" "}
              {selectedMunicipality.type}
            </p>

            <p className="mt-1">
              <span className="text-muted">Total Wards:</span>{" "}
              {wardStats.length}
            </p>

            <p className="mt-1">
              <span className="text-muted">Total Citizens:</span>{" "}
              {selectedMunicipality.totalCitizens}
            </p>
          </div>

          <h3 className="mb-3 text-lg font-semibold text-secondary">
            Ward Statistics
          </h3>

          <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="border-b border-border p-3 text-left font-semibold text-muted">
                    Ward
                  </th>
                  <th className="border-b border-border p-3 text-left font-semibold text-muted">
                    Total Citizens
                  </th>
                  <th className="border-b border-border p-3 text-left font-semibold text-muted">
                    NID Verified %
                  </th>
                </tr>
              </thead>

              <tbody>
                {wardStats.map((ward) => (
                  <tr
                    key={ward.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-3 text-secondary">Ward {ward.wardNo}</td>
                    <td className="p-3 text-secondary">{ward.totalCitizens}</td>
                    <td className="p-3 text-secondary">{ward.nidVerified}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
