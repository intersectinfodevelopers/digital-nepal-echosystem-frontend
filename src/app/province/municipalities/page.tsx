"use client";

import { useState } from "react";

import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import grievances from "../../../../data/grievances.json";
import syncBatches from "../../../../data/sync-batches.json";
import editApprovals from "../../../../data/edit-approvals.json";

export default function MunicipalitiesPage() {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedMunicipality, setSelectedMunicipality] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const municipalities = [
    {
      id: "mun-kummayak",
      name: "Kummayak Rural Municipality",
      type: "RURAL",

      totalCitizens: citizens.length,

      nidVerified:
        citizens.length > 0
          ? Math.round(
              (citizens.filter((c: any) => c.nid_verified).length /
                citizens.length) *
                100,
            )
          : 0,

      pendingApprovals: editApprovals.filter(
        (approval) => approval.status === "PENDING_APPROVAL",
      ).length,

      activeGrievances: grievances.filter(
        (grievance) => grievance.status !== "CLOSED",
      ).length,

      lastSync:
        syncBatches.length > 0
          ? syncBatches[syncBatches.length - 1].submitted_at
          : "N/A",
    },
  ];

  const filteredMunicipalities = municipalities.filter(
    (municipality) => typeFilter === "ALL" || municipality.type === typeFilter,
  );

  const sortedMunicipalities = [...filteredMunicipalities].sort(
    (a: any, b: any) => {
      if (a[sortField] < b[sortField]) {
        return sortOrder === "asc" ? -1 : 1;
      }

      if (a[sortField] > b[sortField]) {
        return sortOrder === "asc" ? 1 : -1;
      }

      return 0;
    },
  );

  const rowsPerPage = 5;

  const paginatedMunicipalities = sortedMunicipalities.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  const wardStats = wards.map((ward: any) => {
    const wardCitizens = citizens.filter(
      (citizen: any) => citizen.ward_id === ward.id,
    );

    return {
      wardNo: ward.ward_no,

      totalCitizens: wardCitizens.length,

      nidVerified:
        wardCitizens.length > 0
          ? Math.round(
              (wardCitizens.filter((citizen: any) => citizen.nid_verified)
                .length /
                wardCitizens.length) *
                100,
            )
          : 0,
    };
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Municipality Comparison
      </h1>

      <div className="mb-4">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
            setSelectedMunicipality(null);
          }}
          className="border rounded p-2"
        >
          <option value="ALL">All Types</option>
          <option value="RURAL">Rural</option>
          <option value="URBAN">Urban</option>
        </select>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th onClick={() => handleSort("name")} className="border p-2 ">
              Municipality
            </th>

            <th className="border p-2 ">Type</th>

            <th className="border p-2 ">Total Citizens</th>

            <th className="border p-2 ">NID Verified %</th>

            <th className="border p-2 ">Pending Approvals</th>

            <th className="border p-2 ">Active Grievances</th>

            <th className="border p-2">Last Sync</th>
          </tr>
        </thead>

        <tbody>
          {paginatedMunicipalities.map((municipality) => (
            <tr
              key={municipality.id}
              onClick={() => setSelectedMunicipality(municipality)}
              className="cursor-pointer "
            >
              <td className="border p-2 cursor-pointer text-blue-500 underline">
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
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {currentPage} of{" "}
          {Math.ceil(sortedMunicipalities.length / rowsPerPage)}
        </span>

        <button
          onClick={() =>
            setCurrentPage((page) =>
              Math.min(
                page + 1,
                Math.ceil(sortedMunicipalities.length / rowsPerPage),
              ),
            )
          }
          disabled={
            currentPage === Math.ceil(sortedMunicipalities.length / rowsPerPage)
          }
          className="px-4 py-2 border rounded disabled:opacity-50"
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
              <strong>Municipality Type:</strong> {selectedMunicipality.type}
            </p>

            <p>
              <strong>Total Wards:</strong> {wards.length}
            </p>

            <p>
              <strong>Total Citizens:</strong>{" "}
              {selectedMunicipality.totalCitizens}
            </p>
          </div>

          <h3 className="text-lg font-semibold mb-3">Ward Level Statistics</h3>

          <table className="w-full border">
            <thead>
              <tr className="">
                <th className="border p-2">Ward No</th>
                <th className="border p-2">Total Citizens</th>
                <th className="border p-2">NID Verified %</th>
              </tr>
            </thead>

            <tbody>
              {wardStats.map((ward) => (
                <tr key={ward.wardNo}>
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
