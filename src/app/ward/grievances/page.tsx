"use client";

import { useState } from "react";
import grievancesData from "../../../../data/grievances.json";
import citizensData from "../../../../data/citizens.json";
import Link from "next/link";

interface Grievance {
  id: string;
  tracking_code: string;
  citizen_id: string;
  category: string;
  status:
    | "RECEIVED"
    | "IN_PROGRESS"
    | "RESOLVED_WARD"
    | "REFERRED_JUDICIAL"
    | "CLOSED";
  filed_at: string;
  escalation_level?: string;
}

type Citizen = {
  id: string;
  name_en: string;
  name_np: string;
};

export default function GrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>(
    grievancesData as Grievance[]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCitizenId, setSelectedCitizenId] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const citizens = citizensData as Citizen[];

  const CATEGORIES = [
    "DATA_INACCURACY",
    "BENEFIT_DENIAL",
    "ID_CARD_ISSUE",
    "PRIVACY_VIOLATION",
    "SYSTEM_ACCESS",
    "OTHER",
  ];

  // Join citizen names safely
  const grievancesWithNames = grievances.map((grv) => {
    const citizen = citizens.find((c) => c.id === grv.citizen_id);

    return {
      ...grv,
      citizen_name: citizen?.name_en || "Unknown Citizen",
      citizen_name_np: citizen?.name_np || "",
    };
  });

  const filteredGrievances = grievancesWithNames
    .filter((g) => {
      const matchesSearch =
        g.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.tracking_code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "ALL" || g.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.filed_at).getTime() - new Date(a.filed_at).getTime()
    );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      RECEIVED: "bg-blue-100 text-blue-800 border-blue-200",
      IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-200",
      RESOLVED_WARD: "bg-green-100 text-green-800 border-green-200",
      REFERRED_JUDICIAL: "bg-orange-100 text-orange-800 border-orange-200",
      CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
    };

    return styles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const generateTrackingCode = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `GRV-${year}-${random}`;
  };

  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCitizenId || !category || !description) return;

    const newGrievance: Grievance = {
      id: `grv-${Date.now()}`,
      tracking_code: generateTrackingCode(),
      citizen_id: selectedCitizenId,
      category,
      status: "RECEIVED",
      filed_at: new Date().toISOString(),
      escalation_level: "WARD",
    };

    setGrievances((prev) => [newGrievance, ...prev]);

    setSelectedCitizenId("");
    setCategory("");
    setDescription("");
    setIsModalOpen(false);

    alert(
      `✅ Grievance filed successfully!\nTracking Code: ${newGrievance.tracking_code}`
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Grievances</h1>
          <p className="text-gray-500 mt-1">
            Citizen complaints and feedback management
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          + File New Grievance
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="border px-4 py-3 rounded-xl flex-1"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-4 py-3 rounded-xl"
        >
          <option value="ALL">All</option>
          <option value="RECEIVED">Received</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED_WARD">Resolved</option>
          <option value="REFERRED_JUDICIAL">Referred</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 text-left">Tracking</th>
              <th className="p-4 text-left">Citizen</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredGrievances.map((g) => (
              <tr key={g.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-mono">{g.tracking_code}</td>
                <td className="p-4">{g.citizen_name}</td>
                <td className="p-4">{g.category}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs border ${getStatusBadge(
                      g.status
                    )}`}
                  >
                    {g.status}
                  </span>
                </td>
                <td className="p-4">
                  <Link
                    className="text-blue-600 hover:underline"
                    href={`/ward/grievances/${g.id}`}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              File New Grievance
            </h2>

            <form onSubmit={handleSubmitGrievance} className="space-y-4">
              <select
                value={selectedCitizenId}
                onChange={(e) => setSelectedCitizenId(e.target.value)}
                className="w-full border p-3 rounded-xl"
              >
                <option value="">Select Citizen</option>
                {citizens.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_en}
                  </option>
                ))}
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border p-3 rounded-xl"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-3 rounded-xl"
                rows={4}
                placeholder="Description..."
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border p-3 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-3 rounded-xl"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}