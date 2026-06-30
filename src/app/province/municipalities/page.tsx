"use client";

import { useState } from "react";

import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import grievances from "../../../../data/grievances.json";
import syncBatches from "../../../../data/sync-batches.json";
import editApprovals from "../../../../data/edit-approvals.json";
import municipalities from "../../../../data/municipalities.json";

export default function MunicipalitiesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
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

  const rowsPerPage = 5;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMunicipalities.length / rowsPerPage),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedMunicipalities = filteredMunicipalities.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

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

  return (
    <div className="p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">
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
          className="rounded border p-2"
        />

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded border p-2"
        >
          <option value="ALL">All Types</option>
          <option value="URBAN_MUNICIPALITY">Urban Municipality</option>
          <option value="RURAL_MUNICIPALITY">Rural Municipality</option>
        </select>
      </div>

      <table className="w-full border border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Municipality</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Total Citizens</th>
            <th className="border p-2">NID Verified %</th>
            <th className="border p-2">Pending Approvals</th>
            <th className="border p-2">Active Grievances</th>
            <th className="border p-2">Last Sync</th>
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
                {municipality.name_en}
              </td>

              <td className="border p-2">{municipality.type}</td>

              <td className="border p-2">{municipality.totalCitizens}</td>

              <td className="border p-2">{municipality.nidVerified}%</td>

              <td className="border p-2">{municipality.pendingApprovals}</td>

              <td className="border p-2">{municipality.activeGrievances}</td>

              <td className="border p-2">{municipality.lastSync}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          disabled={safePage === 1}
          className="rounded border px-4 py-2"
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
          className="rounded border px-4 py-2"
        >
          Next
        </button>
      </div>

      {selectedMunicipality && (
        <div className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">
            {selectedMunicipality.name_en}
          </h2>

          <div className="mb-4 rounded border p-4">
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

          <h3 className="mb-3 text-lg font-semibold">Ward Statistics</h3>

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
