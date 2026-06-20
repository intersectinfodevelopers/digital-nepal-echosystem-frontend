import citizens from "../../../../data/citizens.json";
import editApprovals from "../../../../data/edit-approvals.json";
import grievances from "../../../../data/grievances.json";
import syncBatches from "../../../../data/sync-batches.json";
import wards from "../../../../data/wards.json";
import Link from "next/link";

export default function MunicipalityDashboardPage() {
  const totalCitizens = citizens.length;

  const pendingApprovals = editApprovals.filter(
    (approval) =>
      approval.status === "PENDING_APPROVAL" ||
      approval.status === "CAO_REVIEW",
  ).length;

  const syncConflicts = syncBatches.reduce(
    (total, batch) => total + batch.conflict_count,
    0,
  );

  const activeGrievances = grievances.filter(
    (grievance) =>
      grievance.status !== "CLOSED" && grievance.status !== "RESOLVED_WARD",
  ).length;

  const recentApprovalActions = [...editApprovals]
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

  const now = new Date().getTime();
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

  return (


    <main className="p-6">
      <h1 className="text-2xl font-semibold text-white">
        Municipality Dashboard
      </h1>
      <p className="mt-1 text-sm text-white">
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
