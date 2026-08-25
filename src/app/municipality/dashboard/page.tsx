"use client";

import dynamic from "next/dynamic";
import citizens from "../../../../data/citizens.json";
import districts from "../../../../data/district.json";
import editApprovals from "../../../../data/edit-approvals.json";
import grievances from "../../../../data/grievances.json";
import municipalities from "../../../../data/municipalities.json";
import provinces from "../../../../data/provinces.json";
import syncBatches from "../../../../data/sync-batches.json";
import wards from "../../../../data/wards.json";
import Link from "next/link";
import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { useMapSelection } from "@/contexts/MapSelectionContext";
import { getCurrentSession } from "@/services/auth.service";

const LeafletMap = dynamic(() => import("@/components/Map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-gray-200 bg-[#FAFAFA]">
      <p className="text-sm font-semibold text-gray-500">
        Loading GIS Engine...
      </p>
    </div>
  ),
});

function geoJsonLocalBodyName(name: string) {
  return name
    .replace(/\s+(rural municipality|municipality|metropolitan city|sub-metropolitan city)$/i, "")
    .trim();
}

type Approval = {
  id: string;
  citizen_id: string;
  submitter_id: string;
  status: string;
  old_value_json: Record<string, unknown>;
  new_value_json: Record<string, unknown>;
  submitted_at: string;
  escalated_at?: string;
  rejection_reason?: string;
  approved_at?: string;
  rejected_at?: string;
};

const LOCAL_STORAGE_KEY = "edit-approvals";
const initialApprovals = editApprovals as unknown as Approval[];
let cachedApprovals = initialApprovals;
let cachedApprovalsJson: string | null = null;

function getStoredApprovals() {
  const storedApprovals = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!storedApprovals) {
    cachedApprovals = initialApprovals;
    cachedApprovalsJson = null;
    return initialApprovals;
  }

  if (storedApprovals === cachedApprovalsJson) {
    return cachedApprovals;
  }

  try {
    cachedApprovals = JSON.parse(storedApprovals) as Approval[];
    cachedApprovalsJson = storedApprovals;

    return cachedApprovals;
  } catch {
    return initialApprovals;
  }
}

function getDaysBetween(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return Math.max((end - start) / (1000 * 60 * 60 * 24), 0);
}

function getApprovalRate(approvals: Approval[]) {
  if (approvals.length === 0) {
    return 0;
  }

  const approved = approvals.filter(
    (approval) => approval.status === "APPROVED",
  ).length;

  return Math.round((approved / approvals.length) * 100);
}

function isThisMonth(dateValue?: string) {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getApprovalWeek(dateValue?: string) {
  if (!dateValue || !isThisMonth(dateValue)) {
    return null;
  }

  return Math.min(Math.ceil(new Date(dateValue).getDate() / 7), 5);
}

function subscribeToApprovalStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);

  return () => window.removeEventListener("storage", onStoreChange);
}


export default function MunicipalityDashboardPage() {
  const { selectLocalBody } = useMapSelection();
  const session = getCurrentSession();

  const mapDetails = useMemo(() => {
    const municipality = municipalities.find(
      (item) => item.id === session?.municipality_id,
    );
    const district = districts.find(
      (item) => item.id === municipality?.district_id,
    );
    const province = provinces.find(
      (item) => item.id === district?.province_id,
    );

    if (!municipality || !district || !province) return null;

    return {
      provinceId: province.id.replace(/^prov-/, ""),
      provinceLabel: province.name_en,
      districtName: district.name_en,
      municipalityName: municipality.name_en,
      geoJsonName: geoJsonLocalBodyName(municipality.name_en),
      municipalityType: municipality.type,
    };
  }, [session?.municipality_id]);

  useEffect(() => {
    if (!mapDetails) return;

    selectLocalBody(
      mapDetails.provinceId,
      mapDetails.provinceLabel,
      mapDetails.districtName,
      mapDetails.geoJsonName,
      mapDetails.municipalityType,
    );
  }, [mapDetails, selectLocalBody]);

  const approvals = useSyncExternalStore(
    subscribeToApprovalStorage,
    getStoredApprovals,
    () => initialApprovals,
  );

  const totalCitizens = citizens.length;

  const pendingApprovals = approvals.filter(
    (approval) =>
      approval.status === "PENDING_APPROVAL" ||
      approval.status === "CAO_REVIEW",
  ).length;

  const approvalRate = getApprovalRate(approvals);
  const approvedWithDates = approvals.filter(
    (approval) => approval.status === "APPROVED" && approval.approved_at,
  );
  const averageDaysToApprove =
    approvedWithDates.length === 0
      ? "N/A"
      : (
        approvedWithDates.reduce(
          (total, approval) =>
            total + getDaysBetween(approval.submitted_at, approval.approved_at!),
          0,
        ) / approvedWithDates.length
      ).toFixed(1);
  const rejectionsThisMonth = approvals.filter(
    (approval) =>
      approval.status === "REJECTED" && isThisMonth(approval.rejected_at),
  ).length;
  const approvalTrend = [1, 2, 3, 4, 5].map((week) => ({
    week,
    count: approvals.filter(
      (approval) =>
        approval.status === "APPROVED" &&
        getApprovalWeek(approval.approved_at) === week,
    ).length,
  }));
  const maxTrendCount = Math.max(...approvalTrend.map((week) => week.count), 1);

  const syncConflicts = syncBatches.reduce(
    (total, batch) => total + batch.conflict_count,
    0,
  );

  const activeGrievances = grievances.filter(
    (grievance) =>
      grievance.status !== "CLOSED" && grievance.status !== "RESOLVED_WARD",
  ).length;

  const recentApprovalActions = [...approvals]
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
    )
    .slice(0, 5)
    .map((approval) => {
      const citizen = citizens.find(
        (citizen) => citizen.id === approval.citizen_id,
      );
      const changedFields = Object.keys(approval.new_value_json);
      return {
        id: approval.id,
        citizenName: citizen?.name_en ?? "Unknown Citizen",
        changedFields,
        status: approval.status,
        submittedAt: approval.submitted_at,
      };
    });

  const recentSyncBatches = [...syncBatches]
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
    )
    .slice(0, 5)
    .map((batch) => {
      const ward = wards.find((ward) => ward.id === batch.ward_id);

      return {
        id: batch.batch_id,
        wardName: ward?.name_en ?? "Unknown Ward",
        status: batch.status,
        recordCount: batch.record_count,
        conflictCount: batch.conflict_count,
        submittedAt: batch.submitted_at,
      };
    });

  const stats = [
    {
      title: "Total Citizens",
      value: totalCitizens,
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals,
    },
    {
      title: "Sync Conflicts",
      value: syncConflicts,
    },
    {
      title: "Active Grievances",
      value: activeGrievances,
    },
  ];

  const analytics = [
    {
      title: "Approval Rate",
      value: `${approvalRate}%`,
    },
    {
      title: "Avg. Days to Approve",
      value:
        averageDaysToApprove === "N/A" ? averageDaysToApprove : `${averageDaysToApprove} days`,
    },
    {
      title: "Rejections This Month",
      value: rejectionsThisMonth,
    },
  ];

  const syncHealth = wards.map((ward) => {
    const wardBatches = syncBatches.filter((batch) => batch.ward_id === ward.id);

    const latestBatch = wardBatches.length > 0 ? wardBatches[wardBatches.length - 1] : null;
    const pendingRecord = wardBatches.filter((batch) => batch.status === "PENDING").reduce((total, batch) => total + batch.record_count, 0);

    const conflictCount = wardBatches.reduce((total, batch) => total + batch.conflict_count, 0);

    let status = "Healthy";
    if (conflictCount > 0 || pendingRecord > 0) {
      status = "CRITICAL";
    } else {
      // const hours = latestBatch ? (now - new Date(latestBatch.submitted_at).getTime()) / (1000 * 60 * 60) : 999;
      // if (hours > 24 ) {
      //   status = "STALE";
      // }

      if (!latestBatch) {
        return {
          wardId: ward.id,
          wardName: ward.name_en,
          lastSync: "-",
          pendingRecords: pendingRecord,
          conflictCount,
          status: "NO DATA",
        }
      }
    }
    return {
      wardId: ward.id,
      wardName: ward.name_en,
      lastSync: latestBatch ? latestBatch.submitted_at : "-",
      pendingRecords: pendingRecord,
      conflictCount,
      status,
    }
  })

  const [visibleCount, setVisibleCount] = useState(10)
  const conflictAlerts =
    syncHealth.filter(

      (ward) =>

        ward.conflictCount > 0

    );

  const wardPerformance = wards
    .map((ward) => {
      const wardCitizens = citizens.filter((citizen) => citizen.ward_id === ward.id);
      const wardApprovals = approvals.filter((approval) => {
        const citizen = citizens.find(
          (citizen) => citizen.id === approval.citizen_id,
        );

        return citizen?.ward_id === ward.id;
      });
      const wardBatches = syncBatches.filter((batch) => batch.ward_id === ward.id);
      const latestBatch = [...wardBatches].sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime(),
      )[0];

      return {
        wardId: ward.id,
        wardName: ward.name_en,
        citizensRegistered: wardCitizens.length,
        pendingApprovals: wardApprovals.filter(
          (approval) =>
            approval.status === "PENDING_APPROVAL" ||
            approval.status === "CAO_REVIEW",
        ).length,
        approvalRate: getApprovalRate(wardApprovals),
        lastSync: latestBatch?.submitted_at ?? "-",
      };
    })
    .filter(
      (ward) =>
        ward.citizensRegistered > 0 ||
        ward.pendingApprovals > 0 ||
        ward.lastSync !== "-",
    );

  return (
    <main className="min-h-screen bg-[#f5f7fb] p-4 sm:p-6 lg:p-8">

     

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

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
            Municipality Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Overview of citizens, approvals, ward synchronization and
            grievances.
          </p>

          {mapDetails && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>{mapDetails.municipalityName}</span>
              <span className="text-gray-300">•</span>
              <span>{mapDetails.districtName}</span>
              <span className="text-gray-300">•</span>
              <span>{mapDetails.provinceLabel}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">

          <Link
            href="/municipality/reports"
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            style={{ borderColor: "var(--border)" }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 19V5" />
              <path d="M4 19h16" />
              <path d="M8 16v-5" />
              <path d="M12 16V8" />
              <path d="M16 16v-3" />
            </svg>

            Reports
          </Link>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
              <path d="M4 4v5h5" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
              <path d="M20 20v-5h-5" />
            </svg>

            Refresh
          </button>

        </div>
      </div>


      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

       

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total Citizens
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalCitizens.toLocaleString()}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Registered citizen records
              </p>
            </div>

            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "rgba(15,45,109,0.08)",
                color: "var(--primary)",
              }}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

          </div>
        </div>


       

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Pending Approvals
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {pendingApprovals}
              </p>

              <p className="mt-2 text-xs text-amber-600">
                Requires administrative review
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>

          </div>
        </div>


       
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sync Conflicts
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {syncConflicts}
              </p>

              <p
                className={`mt-2 text-xs ${syncConflicts > 0
                    ? "text-red-600"
                    : "text-green-600"
                  }`}
              >
                {syncConflicts > 0
                  ? "Needs attention"
                  : "No unresolved conflicts"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.3 3.2L2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.2a2 2 0 0 0-3.4 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>

          </div>
        </div>


      

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Active Grievances
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {activeGrievances}
              </p>

              <p className="mt-2 text-xs text-blue-600">
                Open citizen issues
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
              </svg>
            </div>

          </div>
        </div>

      </div>


     

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">

      

        {mapDetails && (
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Municipality Map
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Administrative boundary and local body location
                </p>
              </div>

              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(15,45,109,0.08)",
                  color: "var(--primary)",
                }}
              >
                GIS
              </span>

            </div>

            <div className="h-[430px] w-full p-3">
              <div className="h-full w-full overflow-hidden rounded-lg">
                <LeafletMap
                  center={[27.7, 85.3]}
                  zoom={10}
                  height="100%"
                  minimumLevel="localBody"
                />
              </div>
            </div>

          </section>
        )}


      

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                System Health
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Current ward synchronization status
              </p>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live
            </span>

          </div>

          {(() => {
            const healthy = syncHealth.filter(
              (ward) => ward.status === "HEALTHY"
            ).length;

            const critical = syncHealth.filter(
              (ward) => ward.status === "CRITICAL"
            ).length;

            const noData = syncHealth.filter(
              (ward) => ward.status === "NO DATA"
            ).length;

            const total = syncHealth.length;

            return (
              <>
                <div className="mt-6 flex items-center gap-5">

                  <div
                    className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(
                      #16a34a ${total
                          ? (healthy / total) * 360
                          : 0
                        }deg,
                      #f3f4f6 0deg
                    )`,
                    }}
                  >
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-2xl font-bold text-gray-900">
                        {healthy}
                      </span>

                      <span className="text-[10px] text-gray-500">
                        Healthy
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between border-b border-gray-100 py-2">
                      <span className="text-sm text-gray-600">
                        Total wards
                      </span>

                      <span className="font-semibold text-gray-900">
                        {total}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 py-2">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Healthy
                      </span>

                      <span className="font-semibold text-green-600">
                        {healthy}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 py-2">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Critical
                      </span>

                      <span className="font-semibold text-red-600">
                        {critical}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        No data
                      </span>

                      <span className="font-semibold text-gray-600">
                        {noData}
                      </span>
                    </div>

                  </div>

                </div>

                <Link
                  // href={`/municipality/dashboard/sync-history/${ward.id}`}
                  href="/municipality/dashboard/sync-history"
             
                  className="mt-6 flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--primary)",
                  }}
                >
                  View Sync History
                </Link>
              </>
            );
          })()}

        </section>

      </div>


      

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">


        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Approval Analytics
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Performance of citizen data edit approvals
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-100">

            {analytics.map((item) => (
              <div
                key={item.title}
                className="px-4 first:pl-0 last:pr-0"
              >
                <p className="text-xs leading-5 text-gray-500">
                  {item.title}
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}

          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">

            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Approval performance
              </span>

              <span
                className="text-sm font-bold"
                style={{ color: "var(--primary)" }}
              >
                {approvalRate}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${approvalRate}%`,
                  backgroundColor: "var(--primary)",
                }}
              />
            </div>

          </div>

        </section>


    

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Monthly Approval Trend
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Approved requests by week
              </p>
            </div>

            <span
              className="rounded-md px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: "rgba(15,45,109,0.08)",
                color: "var(--primary)",
              }}
            >
              This month
            </span>

          </div>

          <div className="mt-6 flex h-44 items-end gap-3 border-b border-gray-100">

            {approvalTrend.map((item) => (
              <div
                key={item.week}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
              >

                <span className="text-xs font-medium text-gray-500 opacity-0 transition group-hover:opacity-100">
                  {item.count}
                </span>

                <div
                  className="w-full max-w-[55px] rounded-t-md transition-all hover:opacity-80"
                  style={{
                    height: `${Math.max(
                      (item.count / maxTrendCount) * 130,
                      6
                    )}px`,
                    backgroundColor: "var(--primary)",
                  }}
                  title={`${item.count} approvals`}
                />

                <span className="pb-2 text-[11px] text-gray-500">
                  W{item.week}
                </span>

              </div>
            ))}

          </div>

        </section>

      </div>


     

      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Ward Performance
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Citizen registration, approvals and synchronization by ward
            </p>
          </div>

          <Link
            href="/municipality/dashboard/wards"
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--primary)" }}
          >
            View all wards →
          </Link>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[760px]">

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Ward
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Citizens
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Pending
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Approval
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Last Sync
                </th>

              </tr>
            </thead>

            <tbody>

              {wardPerformance
                .slice(0, 8)
                .map((ward) => (
                  <tr
                    key={ward.wardId}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >

                    <td className="px-5 py-3.5">
                      <Link
                        href={`/municipality/dashboard/wards/${ward.wardId}`}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: "var(--primary)" }}
                      >
                        {ward.wardName}
                      </Link>
                    </td>

                    <td className="px-5 py-3.5 text-right text-sm font-medium text-gray-900">
                      {ward.citizensRegistered.toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5 text-right text-sm text-gray-600">
                      {ward.pendingApprovals}
                    </td>

                    <td className="px-5 py-3.5 text-right">

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ward.approvalRate >= 80
                            ? "bg-green-50 text-green-700"
                            : ward.approvalRate >= 50
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}
                      >
                        {ward.approvalRate}%
                      </span>

                    </td>

                    <td className="px-5 py-3.5 text-right text-xs text-gray-500">
                      {ward.lastSync}
                    </td>

                  </tr>
                ))}

            </tbody>

          </table>

        </div>

      </section>


     

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

       

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Approval Activity
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Latest citizen data edit requests
              </p>
            </div>

            <Link
              href="/municipality/approvals"
              className="text-xs font-semibold hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View all
            </Link>

          </div>

          <div className="space-y-3">

            {recentApprovalActions.map((approval) => (

              <div
                key={approval.id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
              >

                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: "rgba(15,45,109,0.08)",
                    color: "var(--primary)",
                  }}
                >
                  {approval.citizenName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-semibold text-gray-900">
                    {approval.citizenName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    Changed: {approval.changedFields.join(", ")}
                  </p>

                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${approval.status === "APPROVED"
                      ? "bg-green-50 text-green-700"
                      : approval.status === "REJECTED"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                >
                  {approval.status.replaceAll("_", " ")}
                </span>

              </div>

            ))}

          </div>

        </section>


     
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Sync Activity
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Latest synchronization from ward offices
              </p>
            </div>

            <Link
              href="/municipality/dashboard/sync-history"
              className="text-xs font-semibold hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View all
            </Link>

          </div>

          <div className="space-y-3">

            {recentSyncBatches.map((batch) => (

              <div
                key={batch.id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
              >

                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      batch.conflictCount > 0
                        ? "rgba(220,38,38,0.08)"
                        : "rgba(22,163,74,0.08)",
                    color:
                      batch.conflictCount > 0
                        ? "#dc2626"
                        : "#16a34a",
                  }}
                >
                  {batch.conflictCount > 0 ? "!" : "✓"}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-semibold text-gray-900">
                    {batch.wardName}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {batch.recordCount} records
                    {" · "}
                    {batch.conflictCount} conflicts
                  </p>

                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${batch.conflictCount > 0
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                    }`}
                >
                  {batch.status.replaceAll("_", " ")}
                </span>

              </div>

            ))}

          </div>

        </section>

      </div>



      {conflictAlerts.length > 0 && (

        <section className="mt-6 overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">

          <div className="border-b border-red-100 bg-red-50 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                ⚠
              </div>

              <div>
                <h2 className="text-lg font-semibold text-red-800">
                  Conflict Alerts
                </h2>

                <p className="mt-0.5 text-xs text-red-600">
                  {conflictAlerts.length} ward
                  {conflictAlerts.length === 1 ? "" : "s"} require attention
                </p>
              </div>

            </div>

          </div>

          <div className="space-y-2 p-4">

            {conflictAlerts.map((ward) => (

              <div
                key={ward.wardId}
                className="flex flex-col gap-3 rounded-lg border border-red-100 bg-red-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >

                <div>

                  <p className="text-sm font-semibold text-gray-900">
                    {ward.wardName}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    {ward.conflictCount} unresolved conflict
                    {ward.conflictCount === 1 ? "" : "s"}
                  </p>

                </div>

                <Link
                  href={`/municipality/dashboard/conflicts/${ward.wardId}`}
                  className="inline-flex w-fit items-center rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Resolve Conflict
                </Link>

              </div>

            ))}

          </div>

        </section>

      )}


      

      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Sync Health by Ward
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Monitor synchronization status across ward offices
            </p>
          </div>

          <span className="text-xs text-gray-500">
            Showing{" "}
            {Math.min(visibleCount, syncHealth.length)} of{" "}
            {syncHealth.length}
          </span>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[760px]">

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Ward
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Last Sync
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Pending
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Conflicts
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

              </tr>
            </thead>

            <tbody>

              {syncHealth
                .slice(0, visibleCount)
                .map((ward) => (

                  <tr
                    key={ward.wardId}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >

                    <td className="px-5 py-3.5">

                      <Link
                        href={`/municipality/dashboard/sync-history/${ward.wardId}`}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: "var(--primary)" }}
                      >
                        {ward.wardName}
                      </Link>

                    </td>

                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {ward.lastSync}
                    </td>

                    <td className="px-5 py-3.5 text-right text-sm text-gray-700">
                      {ward.pendingRecords}
                    </td>

                    <td className="px-5 py-3.5 text-right">

                      <span
                        className={`text-sm font-semibold ${ward.conflictCount > 0
                            ? "text-red-600"
                            : "text-gray-600"
                          }`}
                      >
                        {ward.conflictCount}
                      </span>

                    </td>

                    <td className="px-5 py-3.5 text-right">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${ward.status === "HEALTHY"
                            ? "bg-green-50 text-green-700"
                            : ward.status === "STALE"
                              ? "bg-amber-50 text-amber-700"
                              : ward.status === "NO DATA"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-red-50 text-red-700"
                          }`}
                      >

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${ward.status === "HEALTHY"
                              ? "bg-green-500"
                              : ward.status === "STALE"
                                ? "bg-amber-500"
                                : ward.status === "NO DATA"
                                  ? "bg-gray-400"
                                  : "bg-red-500"
                            }`}
                        />

                        {ward.status}

                      </span>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>



        {syncHealth.length > 10 && (

          <div className="flex justify-center gap-3 border-t border-gray-100 p-4">

            {visibleCount < syncHealth.length && (
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((prev) => prev + 10)
                }
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style={{
                  backgroundColor: "var(--primary)",
                }}
              >
                Show More
              </button>
            )}

            {visibleCount > 10 && (
              <button
                type="button"
                onClick={() => setVisibleCount(10)}
                className="rounded-lg border px-5 py-2 text-sm font-semibold transition hover:bg-gray-50"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--primary)",
                }}
              >
                Show Less
              </button>
            )}

          </div>

        )}

      </section>

      <div className="mt-6 border-t border-gray-200 py-5 text-center text-xs text-gray-400">
        Digital Nepal · Municipality Administration Portal
      </div>

    </main>
  );
}
