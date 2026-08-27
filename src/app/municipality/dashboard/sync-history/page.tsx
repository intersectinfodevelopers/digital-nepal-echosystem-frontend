"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import syncBatches from "../../../../../data/sync-batches.json";
import wards from "../../../../../data/wards.json";

type SyncBatch = {
  batch_id: string;
  ward_id: string;
  status: string;
  record_count: number;
  conflict_count: number;
  submitted_at: string;
};

export default function SyncHistoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");

  const batches = syncBatches as SyncBatch[];

  const getWardName = (wardId: string) => {
    const ward = wards.find((ward) => ward.id === wardId);

    return ward?.name_en ?? "Unknown Ward";
  };

  const filteredBatches = useMemo(() => {
    return batches
      .filter((batch) => {
        const wardName = getWardName(batch.ward_id);

        const matchesSearch =
          batch.batch_id.toLowerCase().includes(search.toLowerCase()) ||
          wardName.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" || batch.status === statusFilter;

        const matchesWard =
          wardFilter === "ALL" || batch.ward_id === wardFilter;

        return matchesSearch && matchesStatus && matchesWard;
      })
      .sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime(),
      );
  }, [search, statusFilter, wardFilter]);

  const totalRecords = batches.reduce(
    (total, batch) => total + batch.record_count,
    0,
  );

  const totalConflicts = batches.reduce(
    (total, batch) => total + batch.conflict_count,
    0,
  );

  const completedBatches = batches.filter(
    (batch) => batch.status === "COMPLETED",
  ).length;

  const pendingBatches = batches.filter(
    (batch) => batch.status === "PENDING",
  ).length;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-NP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700";

      case "PENDING":
        return "bg-amber-50 text-amber-700";

      case "FAILED":
        return "bg-red-50 text-red-700";

      case "PROCESSING":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] p-4 sm:p-6 lg:p-8">
     
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            />

            <span
              className="text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: "var(--primary)" }}
            >
              Municipality Portal
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Sync History
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View synchronization activity from all ward offices.
          </p>
        </div>

        <Link
          href="/municipality/dashboard"
          className="inline-flex w-fit items-center rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          style={{ borderColor: "var(--border)" }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Batches
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {batches.length}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Synchronization batches
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Records
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalRecords.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Records synchronized
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {completedBatches}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Successfully completed
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Conflicts
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {totalConflicts}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Records requiring attention
          </p>
        </div>
      </div>

    
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
         
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batch or ward..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:bg-white"
            />
          </div>

       
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Ward
            </label>

            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none"
            >
              <option value="ALL">All Wards</option>

              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name_en}
                </option>
              ))}
            </select>
          </div>

          
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </section>

      
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Synchronization History
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredBatches.length} synchronization
              {filteredBatches.length === 1 ? "" : "s"} found
            </p>
          </div>

          <span className="text-xs text-gray-500">
            {pendingBatches} pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Batch ID
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Ward
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Records
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Conflicts
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Submitted
                </th>

                <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBatches.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No synchronization records found.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => (
                  <tr
                    key={batch.batch_id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {batch.batch_id}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Sync Batch
                      </p>
                    </td>

                    
                    <td className="px-5 py-4">
                      <Link
                        href={`/municipality/dashboard/sync-history/${batch.ward_id}`}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: "var(--primary)" }}
                      >
                        {getWardName(batch.ward_id)}
                      </Link>
                    </td>

                   
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {batch.record_count.toLocaleString()}
                      </span>
                    </td>

                    
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          batch.conflict_count > 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {batch.conflict_count}
                      </span>
                    </td>

                    
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-500">
                        {formatDate(batch.submitted_at)}
                      </span>
                    </td>

                   
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                          batch.status,
                        )}`}
                      >
                        {batch.status.replaceAll("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    
      <div className="mt-6 border-t border-gray-200 py-5 text-center text-xs text-gray-400">
        Digital Nepal · Municipality Administration Portal
      </div>
    </main>
  );
}