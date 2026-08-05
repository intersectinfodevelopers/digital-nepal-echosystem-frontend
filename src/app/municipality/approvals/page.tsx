"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import citizens from "../../../../data/citizens.json";
import editApprovals from "../../../../data/edit-approvals.json";
import users from "../../../../data/users.json";
import wards from "../../../../data/wards.json";

type Approval = {
  id: string;
  citizen_id: string;
  submitter_id: string;
  status: string;
  old_value_json: Record<string, unknown>;
  new_value_json: Record<string, unknown>;
  submitted_at: string;
  escalated_at?: string;
};

const LOCAL_STORAGE_KEY = "edit-approvals";
const initialApprovals = editApprovals as unknown as Approval[];

function getDaysPending(submittedAt: string) {
  const submittedDate = new Date(submittedAt);
  const today = new Date();

  const differenceInMs = today.getTime() - submittedDate.getTime();
  const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

  return Math.max(days, 0);
}

function getBusinessDaysPending(submittedAt: string) {
  const submittedDate = new Date(submittedAt);
  const today = new Date();

  let businessDays = 0;
  const currentDate = new Date(submittedDate);

  while (currentDate < today) {
    const day = currentDate.getDay();

    const isSaturday = day === 6;
    const isSunday = day === 0;

    if (!isSaturday && !isSunday) {
      businessDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}

function getStatusBadgeClass(status: string) {
  if (status === "PENDING_APPROVAL") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "CAO_REVIEW") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-gray-100 text-gray-700";
}

export default function MunicipalityApprovalsPage() {
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedField, setSelectedField] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [approvals] = useState<Approval[]>(() => {
    if (typeof window === "undefined") {
      return initialApprovals;
    }

    const storedApprovals = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!storedApprovals) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialApprovals));
      return initialApprovals;
    }

    try {
      return JSON.parse(storedApprovals) as Approval[];
    } catch {
      return initialApprovals;
    }
  });

  const approvalRows = useMemo(() => {
    return approvals.map((approval) => {
      const citizen = citizens.find(
        (citizen) => citizen.id === approval.citizen_id,
      );

      const submitter = users.find((user) => user.id === approval.submitter_id);

      const ward = wards.find((ward) => ward.id === citizen?.ward_id);

      const changedFields = [
        ...new Set([
          ...Object.keys(approval.old_value_json),
          ...Object.keys(approval.new_value_json),
        ]),
      ];

      const daysPending = getDaysPending(approval.submitted_at);
      const businessDaysPending = getBusinessDaysPending(approval.submitted_at);
      const daysSinceEscalation = approval.escalated_at
        ? getDaysPending(approval.escalated_at)
        : null;

      return {
        id: approval.id,
        citizenName: citizen?.name_en ?? "Unknown Citizen",
        wardId: citizen?.ward_id ?? "UNKNOWN",
        wardName: ward?.name_en ?? "Unknown Ward",
        changedFields,
        submittedBy: submitter?.full_name ?? "Unknown User",
        submittedAt: approval.submitted_at,
        daysPending,
        daysSinceEscalation,
        status: approval.status,
        isCaoReviewDue:
          approval.status !== "APPROVED" &&
          approval.status !== "REJECTED" &&
          businessDaysPending > 5,
      };
    });
  }, [approvals]);

  const pendingApprovalRows = useMemo(() => {
    return approvalRows.filter(
      (approval) =>
        approval.status !== "APPROVED" && approval.status !== "REJECTED",
    );
  }, [approvalRows]);

  const allApprovalsCount = pendingApprovalRows.length;

  const caoReviewCount = pendingApprovalRows.filter(
    (approval) => approval.status === "CAO_REVIEW",
  ).length;

  const fieldOptions = useMemo(() => {
    const fields = pendingApprovalRows.flatMap(
      (approval) => approval.changedFields,
    );
    return Array.from(new Set(fields));
  }, [pendingApprovalRows]);

  const filteredApprovals = pendingApprovalRows.filter(
    (approval) =>
      (selectedWard === "ALL" || approval.wardId === selectedWard) &&
      (selectedStatus === "ALL" || approval.status === selectedStatus) &&
      (selectedField === "ALL" ||
        approval.changedFields.includes(selectedField)),
  );

  const totalPages = Math.ceil(filteredApprovals.length / pageSize);

  const paginatedApprovals = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredApprovals.slice(start, start + pageSize);
  }, [filteredApprovals, page]);

  return (
    <main className="p-6">
      <div>
        <h1 className="text-2xl font-semibold text-black">Approval Queue</h1>

        <p className="mt-1 text-sm text-black">
          Review citizen data edit requests submitted from ward offices.
        </p>
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setSelectedStatus("ALL")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            selectedStatus === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Approvals ({allApprovalsCount})
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("CAO_REVIEW")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            selectedStatus === "CAO_REVIEW"
              ? "bg-orange-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          CAO Review ({caoReviewCount})
        </button>
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Filter by Ward
            </label>

            <select
              value={selectedWard}
              onChange={(event) => { setSelectedWard(event.target.value); setPage(1); }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-500"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Filter by Status
            </label>

            <select
              value={selectedStatus}
              onChange={(event) => { setSelectedStatus(event.target.value); setPage(1); }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="CAO_REVIEW">CAO Review</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Filter by Changed Field
            </label>

            <select
              value={selectedField}
              onChange={(event) => { setSelectedField(event.target.value); setPage(1); }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-500"
            >
              <option value="ALL">All Fields</option>

              {fieldOptions.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedStatus === "CAO_REVIEW"
              ? "CAO Review Requests"
              : "Citizen Edit Requests"}
          </h2>

          <p className="text-sm text-gray-600">
            {filteredApprovals.length} of{" "}
            {selectedStatus === "CAO_REVIEW"
              ? caoReviewCount
              : allApprovalsCount}{" "}
            {selectedStatus === "CAO_REVIEW"
              ? "CAO review requests."
              : "pending approval requests."}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Citizen Name</th>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3">Changed Field(s)</th>
                <th className="px-4 py-3">Submitted By</th>
                <th className="px-4 py-3">Submitted At</th>
                <th className="px-4 py-3">Days Pending</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedApprovals.map((approval) => (
                <tr
                  key={approval.id}
                  className={
                    approval.isCaoReviewDue ? "bg-amber-50" : "hover:bg-gray-50"
                  }
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {approval.citizenName}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {approval.wardName}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {approval.changedFields.join(", ")}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {approval.submittedBy}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {approval.submittedAt}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {approval.daysPending} days
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                          approval.status,
                        )}`}
                      >
                        {approval.status}
                      </span>

                      {approval.isCaoReviewDue && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          {approval.daysSinceEscalation !== null
                            ? `ESCALATED ${approval.daysSinceEscalation} DAYS AGO`
                            : "CAO REVIEW DUE"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/municipality/approvals/${approval.id}`}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredApprovals.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    No approval requests match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages || 1}
          onPageChange={setPage}
          totalItems={filteredApprovals.length}
        />
      </div>
    </main>
  );
}
