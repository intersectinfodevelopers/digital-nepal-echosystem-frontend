"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DiffViewer } from "@/components/ui/DiffViewer";
import citizensData from "../../../../../data/citizens.json";
import syncBatchesData from "../../../../../data/sync-batches.json";
import wardsData from "../../../../../data/wards.json";

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
  name_en?: string;
  ward_id?: string;
};

type Ward = {
  id: string;
  name_en?: string;
  ward_no?: number | string;
};

type ConflictDetail = Conflict & {
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

export default function ConflictDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
  const [showMergeOptions, setShowMergeOptions] = useState(false);
  const [deviceFieldSelections, setDeviceFieldSelections] = useState<
    Record<string, boolean>
  >({});
  const [toastMessage, setToastMessage] = useState("");

  const citizens = citizensData as Citizen[];
  const wards = wardsData as Ward[];

  const conflicts: ConflictDetail[] = syncBatches.flatMap((batch) =>
    (batch.conflicts ?? []).map((conflict) => ({
      ...conflict,
      batch_id: batch.batch_id,
      device_id: batch.device_id,
      ward_id: batch.ward_id,
    })),
  );

  const conflict = conflicts.find((item) => item.id === params.id);

  if (!conflict) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Conflict not found
          </h1>

          <Link
            href="/municipality/conflicts"
            className="mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Back to conflicts
          </Link>
        </section>
      </main>
    );
  }

  const citizen = citizens.find((item) => item.id === conflict.citizen_id);
  const ward = wards.find((item) => item.id === conflict.ward_id);
  const conflictId = conflict.id;
  const status = conflict.resolution_status ?? "PENDING_REVIEW";
  const diffChanges = (conflict.conflict_fields ?? []).map((field) => ({
    id: field.field_name,
    field: field.field_name,
    oldValue: field.server_value,
    newValue: field.device_value,
  }));
  const isResolved = status === "MERGED" || status === "OVERWRITTEN";

  function updateConflict(
    nextStatus: ResolutionStatus,
    shouldUseDevice: (fieldName: string) => boolean,
    shouldRedirect = false,
  ) {
    const updatedBatches = syncBatches.map((batch) => {
      const updatedConflicts = (batch.conflicts ?? []).map((item) => {
        if (item.id !== conflictId) {
          return item;
        }

        return {
          ...item,
          resolution_status: nextStatus,
          conflict_fields: (item.conflict_fields ?? []).map((field) => ({
            ...field,
            server_value: shouldUseDevice(field.field_name)
              ? field.device_value
              : field.server_value,
          })),
        };
      });

      return {
        ...batch,
        conflict_count: updatedConflicts.filter(
          (item) => (item.resolution_status ?? "PENDING_REVIEW") === "PENDING_REVIEW",
        ).length,
        conflicts: updatedConflicts,
      };
    });

    setSyncBatches(updatedBatches);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBatches));
    setShowMergeOptions(false);
    setToastMessage("Conflict resolved successfully.");

    setTimeout(() => {
      setToastMessage("");

      if (shouldRedirect) {
        router.push("/municipality/conflicts");
      }
    }, 1200);
  }

  function handleUseServerValue() {
    updateConflict("MERGED", () => false, true);
  }

  function handleUseDeviceValue() {
    updateConflict("OVERWRITTEN", () => true, true);
  }

  function handleMerge() {
    updateConflict(
      "MERGED",
      (fieldName) => deviceFieldSelections[fieldName] ?? false,
      true,
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toastMessage}
        </div>
      )}

      <div className="mx-auto space-y-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Municipality / Sync Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Conflict Detail
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Compare server data with the offline device submission.
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Citizen
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {citizen?.full_name ??
                  citizen?.name_en ??
                  citizen?.name ??
                  "Unknown Citizen"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Ward
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {formatWardName(ward)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Device ID
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {conflict.device_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Batch ID
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {conflict.batch_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Created At
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {conflict.created_at}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Status
              </p>
              <span
                className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                  status,
                )}`}
              >
                {status}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Conflict Difference
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review field-level differences before resolving the sync conflict.
            </p>
          </div>

          <div className="p-5">
            <DiffViewer
              changes={diffChanges}
              oldLabel="SERVER VALUE"
              newLabel="DEVICE VALUE"
              emptyMessage="No conflict differences found."
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Resolve Conflict
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isResolved}
              onClick={handleUseServerValue}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use Server Value
            </button>

            <button
              type="button"
              disabled={isResolved}
              onClick={handleUseDeviceValue}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use Device Value
            </button>

            <button
              type="button"
              disabled={isResolved}
              onClick={() => setShowMergeOptions((current) => !current)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Merge
            </button>
          </div>

          {isResolved && (
            <p className="mt-3 text-sm text-slate-500">
              This conflict has already been resolved.
            </p>
          )}

          {showMergeOptions && !isResolved && (
            <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
              {(conflict.conflict_fields ?? []).map((field) => (
                <label
                  key={field.field_name}
                  className="flex items-center gap-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={deviceFieldSelections[field.field_name] ?? false}
                    onChange={(event) =>
                      setDeviceFieldSelections((current) => ({
                        ...current,
                        [field.field_name]: event.target.checked,
                      }))
                    }
                    className="size-4 rounded border-slate-300"
                  />
                  <span>
                    Use device value for{" "}
                    <span className="font-medium text-slate-900">
                      {field.field_name}
                    </span>
                  </span>
                </label>
              ))}

              <button
                type="button"
                onClick={handleMerge}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Resolve Merge
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
