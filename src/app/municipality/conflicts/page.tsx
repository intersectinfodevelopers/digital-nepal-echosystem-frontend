"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import syncBatchesData from "../../../../data/sync-batches.json";
import citizensData from "../../../../data/citizens.json";
import wardsData from "../../../../data/wards.json";

type ResolutionStatus = "PENDING_REVIEW" | "MERGED" | "OVERWRITTEN";

type ConflictField = {
  field_name: string;
  server_value: string | number | boolean | null;
  device_value: string | number | boolean | null;
};

type Conflict = {
  id: string;
  citizen_id: string;
  created_at: string;
  resolution_status?: ResolutionStatus;
  conflict_fields?: ConflictField[];
};

type SyncBatch = {
  batch_id: string;
  device_id: string;
  ward_id: string;
  status: string;
  record_count: number;
  conflict_count: number;
  submitted_at: string;
  completed_at: string | null;
  conflicts?: Conflict[];
};

type Citizen = {
  id: string;
  full_name?: string;
  name?: string;
  ward_id?: string;
};

type Ward = {
  id: string;
  name_en?: string;
  ward_no?: number | string;
};

type ConflictRow = Conflict & {
  batch_id: string;
  device_id: string;
  ward_id: string;
};

const LOCAL_STORAGE_KEY = "sync-batches";
const initialSyncBatches = syncBatchesData as SyncBatch[];

function getStatusBadgeClass(status: string) {
  if (status === "PENDING_REVIEW") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (status === "MERGED") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (status === "OVERWRITTEN") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function formatWardName(ward?: Ward) {
  if (!ward) return "N/A";

  return ward.name_en ?? (ward.ward_no ? `Ward ${ward.ward_no}` : ward.id);
}

export default function ConflictsPage() {
  const [wardFilter, setWardFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [syncBatches, setSyncBatches] =
    useState<SyncBatch[]>(initialSyncBatches);

  useEffect(() => {
    window.setTimeout(() => {
      try {
        const storedBatches = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (storedBatches) {
          setSyncBatches(JSON.parse(storedBatches) as SyncBatch[]);
        }
      } catch {
        setSyncBatches(initialSyncBatches);
      }
    }, 0);
  }, []);

  const citizens = citizensData as Citizen[];
  const wards = wardsData as Ward[];

  const conflictRows: ConflictRow[] = useMemo(() => {
    return syncBatches.flatMap((batch) =>
      (batch.conflicts ?? []).map((conflict) => ({
        ...conflict,
        batch_id: batch.batch_id,
        device_id: batch.device_id,
        ward_id: batch.ward_id,
      }))
    );
  }, [syncBatches]);

  const filteredConflicts = useMemo(() => {
    return conflictRows.filter((conflict) => {
      const status = conflict.resolution_status ?? "PENDING_REVIEW";
      const isUnresolved = status === "PENDING_REVIEW";

      const matchesWard =
        wardFilter === "ALL" || conflict.ward_id === wardFilter;

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      return isUnresolved && matchesWard && matchesStatus;
    });
  }, [conflictRows, wardFilter, statusFilter]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto space-y-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Municipality / Sync Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Sync Conflicts
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Review offline device conflicts and resolve citizen data mismatches.
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Filter by ward
              </label>

              <select
                value={wardFilter}
                onChange={(event) => setWardFilter(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="ALL">All Wards</option>

                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {formatWardName(ward)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Filter by resolution status
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING_REVIEW">Pending Review</option>
              </select>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Conflict Queue</h2>

            <p className="text-sm text-slate-500">
              {filteredConflicts.length} conflict
              {filteredConflicts.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Citizen Name</th>
                  <th className="px-4 py-3">Ward</th>
                  <th className="px-4 py-3">Device ID</th>
                  <th className="px-4 py-3">Conflict Fields</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredConflicts.map((conflict) => {
                  const citizen = citizens.find(
                    (item) => item.id === conflict.citizen_id
                  );

                  const ward = wards.find(
                    (item) => item.id === conflict.ward_id
                  );

                  const status =
                    conflict.resolution_status ?? "PENDING_REVIEW";

                  return (
                    <tr key={conflict.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {citizen?.full_name ??
                          citizen?.name ??
                          "Unknown Citizen"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatWardName(ward)}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {conflict.device_id}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {conflict.conflict_fields?.length ?? 0}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {conflict.created_at}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/municipality/conflicts/${conflict.id}`}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {filteredConflicts.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No conflicts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
