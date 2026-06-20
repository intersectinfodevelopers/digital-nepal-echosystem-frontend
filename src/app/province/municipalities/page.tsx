"use client";

import { useState } from "react";

import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import grievances from "../../../../data/grievances.json";
import syncBatches from "../../../../data/sync-batches.json";
import editApprovals from "../../../../data/edit-approvals.json";

export default function MunicipalitiesPage() {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedMunicipality, setSelectedMunicipality] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const municipalityMap = new Map();

  wards.forEach((ward: any) => {
    if (!municipalityMap.has(ward.municipality_id)) {
      municipalityMap.set(ward.municipality_id, {
        id: ward.municipality_id,
        name: ward.name_en.replace(/ Ward No\. \d+$/, ""),
        type: /municipality/i.test(ward.name_en) ? "URBAN" : "RURAL",
      });
    }
  });

  const municipalities = Array.from(municipalityMap.values()).map(
    (municipality: any) => {
      const municipalityWards = wards.filter(
        (ward: any) => ward.municipality_id === municipality.id,
      );

      const wardIds = municipalityWards.map((ward: any) => ward.id);

      const municipalityCitizens = citizens.filter((citizen: any) =>
        wardIds.includes(citizen.ward_id),
      );

      return {
        ...municipality,

        totalCitizens: municipalityCitizens.length,

        nidVerified:
          municipalityCitizens.length > 0
            ? Math.round(
                (municipalityCitizens.filter(
                  (citizen: any) => citizen.nid_verified,
                ).length /
                  municipalityCitizens.length) *
                  100,
              )
            : 0,

        pendingApprovals: editApprovals.filter((approval: any) =>
          wardIds.includes(approval.ward_id),
        ).length,

        activeGrievances: grievances.filter((grievance: any) =>
          wardIds.includes(grievance.ward_id),
        ).length,

        lastSync: (() => {
          const municipalitySyncBatches = syncBatches.filter(
            (batch: any) => batch.municipality_id === municipality.id,
          );
          return municipalitySyncBatches.length > 0
            ? municipalitySyncBatches[municipalitySyncBatches.length - 1]
                ?.submitted_at || "N/A"
            : "N/A";
        })(),
      };
    },
  );

  const filteredMunicipalities = municipalities.filter(
    (municipality) =>
      (typeFilter === "ALL" || municipality.type === typeFilter) &&
      municipality.name.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedMunicipalities = [...filteredMunicipalities].sort((a, b) => {
    const valueA = a[sortField as keyof typeof a];
    const valueB = b[sortField as keyof typeof b];

    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;

    return 0;
  });

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const wardStats = selectedMunicipality
    ? wards
        .filter((ward: any) => ward.municipality_id === selectedMunicipality.id)
        .map((ward: any) => {
          const wardCitizens = citizens.filter(
            (citizen: any) => citizen.ward_id === ward.id,
          );

          return {
            id: ward.id,
            wardNo: ward.ward_no,

            totalCitizens: citizens.length,

            nidVerified:
              citizens.length > 0
                ? Math.round(
                    (citizens.filter((citizen: any) => citizen.nid_verified)
                      .length /
                      citizens.length) *
                      100,
                  )
                : 0,

            pendingApprovals: editApprovals.filter(
              (approval: any) => approval.ward_id === ward.id,
            ).length,

            activeGrievances: grievances.filter(
              (grievance: any) => grievance.ward_id === ward.id,
            ).length,
          };
        })
    : [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Municipality Comparison
      </h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search municipality..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded p-2"
        />

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded p-2"
        >
          <option value="ALL">All Types</option>
          <option value="RURAL">Rural</option>
          <option value="URBAN">Urban</option>
        </select>
      </div>

      <table className="w-full border border-collapse">
        <thead>
          <tr>
            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Municipality
            </th>

            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("type")}
            >
              Type
            </th>

            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("totalCitizens")}
            >
              Total Citizens
            </th>

            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("nidVerified")}
            >
              NID Verified %
            </th>

            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("pendingApprovals")}
            >
              Pending Approvals
            </th>

            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("activeGrievances")}
            >
              Active Grievances
            </th>

            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("lastSync")}
            >
              Last Sync
            </th>
          </tr>
        </thead>

        <tbody>
          {paginatedMunicipalities.map((municipality) => (
            <tr
              key={municipality.id}
              onClick={() => setSelectedMunicipality(municipality)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <td className="border p-2 text-blue-600 underline">
                {municipality.name}
              </td>

              <td className="border p-2">{municipality.type}</td>

              <td className="border p-2">{municipality.totalCitizens}</td>

              <td className="border p-2">{municipality.nidVerified}%</td>

              <td className="border p-2">{municipality.pendingApprovals}</td>

              <td className="border p-2">{municipality.activeGrievances}</td>

              <td className="border p-2">{municipality.lastSync}</td>
            </tr>
          ))}

          {paginatedMunicipalities.length === 0 && (
            <tr>
              <td colSpan={7} className="border p-4 text-center text-gray-500">
                No municipalities found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          disabled={safePage === 1}
          className="border rounded px-4 py-2"
        >
          Previous
        </button>

        <span>
          Page {safePage} of {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((page) => Math.min(page + 1, totalPages))
          }
          disabled={safePage === totalPages}
          className="border rounded px-4 py-2"
        >
          Next
        </button>
      </div>

      {selectedMunicipality && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">
            {selectedMunicipality.name}
          </h2>

          <div className="border rounded p-4 mb-4">
            <p>
              <strong>Type:</strong> {selectedMunicipality.type}
            </p>

            <p>
              <strong>Total Wards:</strong> {wardStats.length}
            </p>

            <p>
              <strong>Total Citizens:</strong>{" "}
              {selectedMunicipality.totalCitizens}
            </p>
          </div>

          <h3 className="font-semibold text-lg mb-3">Ward Statistics</h3>

          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">Ward</th>
                <th className="border p-2">Total Citizens</th>
                <th className="border p-2">NID Verified %</th>
              </tr>
            </thead>

            <tbody>
              {wardStats.map((ward) => (
                <tr key={ward.id}>
                  <td className="border p-2">Ward {ward.wardNo}</td>

                  <td className="border p-2">{ward.totalCitizens}</td>

                  <td className="border p-2">{ward.nidVerified}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
