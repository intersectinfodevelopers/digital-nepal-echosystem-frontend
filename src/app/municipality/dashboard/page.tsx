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
import { useEffect, useMemo, useSyncExternalStore } from "react";
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


    <main className="p-6">
      <h1 className="text-2xl font-semibold text-black">
        Municipality Dashboard
      </h1>
      <p className="mt-1 text-sm text-black">
        Overview of citizens, approvals, sync conflicts and grievances.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{stat.title}</p>

            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {mapDetails && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {mapDetails.municipalityName} Map
            </h2>
            <p className="text-sm text-gray-600">
              Administrative boundary of {mapDetails.municipalityName}.
            </p>
          </div>

          <div className="h-[500px] w-full overflow-hidden rounded-xl">
            <LeafletMap center={[27.7, 85.3]} zoom={10} height="100%" />
          </div>
        </section>
      )}

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Approval Analytics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {analytics.map((item) => (
            <div key={item.title} className="rounded-md border border-gray-100 p-4">
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Monthly Approval Trend
        </h2>
        <div className="mt-4 flex h-44 items-end gap-4 border-b border-gray-200">
          {approvalTrend.map((item) => (
            <div key={item.week} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-blue-600"
                style={{ height: `${(item.count / maxTrendCount) * 140}px` }}
                title={`${item.count} approvals`}
              />
              <span className="pb-2 text-xs text-gray-600">Week {item.week}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Ward Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                  Ward
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                  Citizens Registered
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                  Pending Approvals
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                  Approval Rate
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                  Last Sync
                </th>
              </tr>
            </thead>
            <tbody>
              {wardPerformance.map((ward) => (
                <tr key={ward.wardId} className="hover:bg-gray-100">
                  <td className="border p-2">{ward.wardName}</td>
                  <td className="border p-2">{ward.citizensRegistered}</td>
                  <td className="border p-2">{ward.pendingApprovals}</td>
                  <td className="border p-2">{ward.approvalRate}%</td>
                  <td className="border p-2">{ward.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Approval Activity
          </h2>
          <p className="text-sm text-gray-600">
            Latest citizen data edit requests from ward offices.
          </p>
        </div>
        <div className="space-y-3">
          {recentApprovalActions.map((approval) => (
            <div
              key={approval.id}
              className="flex items-center justify-between rounded-md border border-gray-100 p-3"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {approval.citizenName}
                </p>
                <p className="text-sm text-gray-600">
                  Changed field: {approval.changedFields.join(", ")}
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {approval.status}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Sync Batches
          </h2>

          <p className="text-sm text-gray-600">
            Latest offline sync activity submitted from ward offices.
          </p>
        </div>

        <div className="space-y-3">
          {recentSyncBatches.map((batch) => (
            <div
              key={batch.id}
              className="flex items-center justify-between rounded-md border border-gray-100 p-3"
            >
              <div>
                <p className="font-medium text-gray-900">{batch.wardName}</p>

                <p className="text-sm text-gray-600">
                  {batch.recordCount} records · {batch.conflictCount} conflicts
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {batch.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border  border-red-200  bg-red-50  p-5"   >
        <h2
          className=" mb-4 text-lg font-semibold  text-red-700">
          Conflict Alerts
        </h2>

        {conflictAlerts.length === 0 ? (
          <p>No unresolved conflicts</p>
        ) : (
          <div className="space-y-3">
            {conflictAlerts.map((ward) => (
              <div
                key={ward.wardId}
                className=" flex items-center justify-between rounded border  bg-white  p-3">
                <div>
                  <p className="font-medium">
                    ⚠ {ward.wardName}
                  </p>

                  <p className="text-sm text-gray-600">
                    {ward.conflictCount} unresolved conflicts
                  </p>
                </div>

                <Link
                  href={`/municipality/dashboard/conflicts/${ward.wardId}`}
                  className="text-blue-600 hover:underline"
                >
                  Resolve
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Sync Health by Ward</h2>
        <table className="w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                Ward
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                Last Sync
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                Pending Records
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                Conflicts
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {syncHealth.map((ward) => (
              <tr
                key={ward.wardId}
                className="hover:bg-gray-100"
              >
                <td className="border p-2">

                  <Link
                    href={`/municipality/dashboard/sync-history/${ward.wardId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {ward.wardName}
                  </Link>

                </td>

                <td className="border p-2">
                  {ward.lastSync}
                </td>

                <td className="border p-2">
                  {ward.pendingRecords}
                </td>

                <td className="border p-2">
                  {ward.conflictCount}
                </td>

                <td className="border p-2">

                  <span
                    className={
                      ward.status === "HEALTHY"
                        ? "text-green-600"

                        : ward.status === "STALE"
                          ? "text-yellow-600"

                          : ward.status === "NO DATA"
                            ? "text-gray-600"

                            : "text-red-600"
                    }
                  >

                    {ward.status}

                  </span>

                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </section>
    </main>
  );
}
